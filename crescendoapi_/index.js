
// ---------- REQUIRES ----------
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { fetchSongInfo, findDominantGenre} = require('./spotify');
const {getDJSongsStats, getAcceptedSongIds, getGenresFromSpotify} = require ('./PerfilDj')
const { QueryDB, QueryDBp } = require("./SQL");
require("dotenv").config()
const QRCode = require('qrcode');
const cors = require("cors")
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const router = express.Router();



// ---------- APP SETUP ----------
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5500', // permitir solicitudes desde localhost:3000
  'https://crescendo-nine.vercel.app',
];


app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // permitir solicitudes sin origen (como las realizadas con curl)
    if (allowedOrigins.indexOf(origin) === -1) {
      const message = `El origen CORS ${origin} no está permitido.`;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  },
  methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
  credentials: true,
}));

app.set("trust proxy", 1);

app.use(cookieParser());


// ---------- MIDDLEWARE ----------
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.userId;
        next();
    });
}

// ---------- ROUTES ----------


// ----------Registration route--------------   OK
app.post('/api/register', async (req, res) => {
    try {
        const {userName, password} = req.body;

        if (!userName || !password) {
            return res.status(400).json({ error: "Both username and password are required" });
        }
        
        const existingUser = await QueryDBp("SELECT * FROM users WHERE username = ?", [userName]);
        if (existingUser[0].length > 0) {
            return res.status(400).json({ error: "Username already in use" });
        }
        // const existingEmail = await QueryDBp("SELECT * FROM users WHERE email = ?", [email]);
        // if (existingEmail[0].length > 0) {
        //     return res.status(400).json({ error: "Email already in use" });
        // }
        const hashedPassword = await bcrypt.hash(password, 10);
        await QueryDBp("INSERT INTO users (username, password) VALUES (?, ?)", [userName, hashedPassword]);
        return res.status(200).json({message: "registro exitoso"});

    } catch (err) {
        res.status(500).json({ error: err });
    }
});



// ----------------Login route-------------------   OK
app.post('/api/login', async (req, res) => {
    const logdj = {
        userName: req.body.userName,
        password: req.body.password,
    }

    // Primero, obtienes el usuario basado en el username
    const result = await QueryDBp(`SELECT * FROM users WHERE username = ?`, [logdj.userName]);

    // Si no hay usuario, envía un error
    if (result[0].length == 0) {
        return res.status(400).json({
            error: "Incorrect password or username"
        });
    }

    // Ahora, compara la contraseña ingresada con la contraseña hasheada en la base de datos
    const user = result[0][0]; // Aquí asumimos que el usuario se encuentra en la primera posición del resultado
    const validPassword = await bcrypt.compare(logdj.password, user.password);

    // Si las contraseñas no coinciden, envía un error
    if (!validPassword) {
        return res.status(400).json({
            error: "Incorrect password or username"
        });
    }

    // Creo Family Token
    const familyToken = crypto.randomBytes(40).toString('hex');

    // Creo Access y Refresh Token 
    const accessToken = jwt.sign({ userId: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Almacenar el refresh token y el family token en la base de datos con su fecha de vencimiento
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5); // Añade 5 horas
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    // Me comunico con la base de datos para guardar refresh token y family token
    const sql = `INSERT INTO refresh_tokens (token, family_token, username, expiry_date) VALUES ('${refreshToken}', '${familyToken}', '${user.username}', '${formattedDate}')`;
    await QueryDBp(sql);

    // Devuelvo los tokens para que se almacenen en el localStorage del cliente
    res.status(200).json({
        message: 'Login successful', 
        accessToken,
        refreshToken
    });
});



//----------------Crear Fiesta-------------------------

app.post('/api/createParty', authenticateToken, async (req, res) => {
    const username = req.userId; 
    const partyName = req.body.partyName

    // Obtener la fecha actual en formato 'YYYY-MM-DD' o el formato que acepte tu base de datos
    const partyDate = new Date().toISOString().split('T')[0];

    try {
        const [result] = await QueryDBp('INSERT INTO party (username, party_date, party_name) VALUES (?, ?, ?)', [username, partyDate, partyName]);
        if (result.affectedRows > 0) {
            const party_id = result.insertId;
            res.json({
                success: true,
                message: 'Party creada con éxito',
                party_id: party_id
            });
        } else {
            res.status(500).json({ error: 'No se pudo crear la party' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al crear la party' });
    }
});


//----------------Party History-------------------------

app.get('/api/partyhistory', authenticateToken, async (req, res) => {
    const username = req.userId;

    try {
        // Obtener todos los party_id y party_name de un username
        const [parties] = await QueryDBp('SELECT party_id, party_name FROM party WHERE username = ?', [username]);

        res.json({ success: true, parties });
    } catch (error) {
        console.error('Error al procesar la petición:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//---------------Party History para publico---------
app.get('/api/partyhistoryP/:party_id', async (req, res) => {
    const party_id = req.params.party_id;

    try {
        const [djResult] = await QueryDBp(`SELECT username FROM party WHERE party_id = ?`, [party_id]);

        // Verifica si se obtuvo algún resultado y que el resultado tiene una propiedad 'username'
        if (djResult.length === 0 || !djResult[0].username) {
            return res.status(404).json({ error: 'DJ no encontrado para el party_id proporcionado' });
        }

        const username = djResult[0].username;
        console.log(username); // Debería mostrar "Lucas"

        const [parties] = await QueryDBp('SELECT party_id, party_name FROM party WHERE username = ?', [username]);

        res.json({ success: true, parties });
    } catch (error) {
        console.error('Error al procesar la petición:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//----------------Rate Song----------------------------

app.post('/api/rateSong', async (req, res) => {
    const { song_id, song_rating } = req.body;

    // Validaciones básicas
    if(!song_id || !song_rating) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    try {
        // Actualizar la calificación de la canción en la base de datos.
        const [result] = await QueryDBp('UPDATE songs SET song_rating = ? WHERE song_id = ?', [song_rating, song_id]);

        if(result.affectedRows > 0) {
            res.json({ 
                success: true, 
                message: 'Calificación actualizada con éxito' 
            });
        } else {
            res.status(404).json({ error: 'Canción no encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

//-----------------Request song route------------------   OK
//Le pasas el id de la canción seleccionada a la base de datos. 
app.post('/api/store-song-request', async (req, res) => {
    const { song_id, party_id } = req.body;

    // Validación básica
    if (!song_id || !party_id) {
        return res.status(400).json({ error: "song_id and party_id are required" });
    }

    try {
        // Verificar si la canción ya existe en la base de datos
        const currentSongQueryResult = await QueryDBp(`SELECT * FROM songs WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);

        // Verificar si la consulta devolvió resultados
        if (currentSongQueryResult.length > 0 && currentSongQueryResult[0].length > 0) {
            // Si la canción existe, incrementar request_number
            await QueryDBp(`UPDATE songs SET request_number = request_number + 1 WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);
            console.log("Incremented request number for existing song");
        } else {
            // Si no existe, agregar la canción con request_number inicial de 1
            await QueryDBp(`INSERT INTO songs (song_id, party_id, song_state, request_number) VALUES (?, ?, 'hold', 1)`, [song_id, party_id]);
            console.log("Added new song");
        }

        return res.status(200).json({ message: "La solicitud de canción ha sido procesada exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Ocurrió un error al procesar la solicitud de canción" });
    }
});




//---------------Show requested songs (dj only)------------------  OK
app.get('/api/selectedsongs/:party_id', async (req, res) => {
    try {
        const party_id = req.params.party_id;

        // Obtener song_id, song_state y request_number de la tabla songs para el party_id dado
        const [songs] = await QueryDBp(`SELECT song_id, song_state, request_number FROM songs WHERE party_id = ?`, [party_id]);

        const CLIENT_ID = process.env.clientId;
        const CLIENT_SECRET = process.env.clientSecret;

        const songInfoMap = new Map();

        for (const song of songs) {
            // Consultar la información de cada canción individualmente
            const [existingSongInfo] = await QueryDBp(`SELECT * FROM song_info WHERE song_id = ?`, [song.song_id]);

            if (existingSongInfo.length > 0) {
                console.log("Información recuperada de la base de datos para song_id:", song.song_id, existingSongInfo[0]); // Log de la información recuperada
                songInfoMap.set(song.song_id, {
                    ...existingSongInfo[0],
                    song_state: song.song_state,
                    request_number: song.request_number
                });
            } else {
                console.log("Solicitando información a Spotify para song_id:", song.song_id); // Log de la canción solicitada a Spotify
                const spotifySongInfo = await fetchSongInfo(song.song_id, CLIENT_ID, CLIENT_SECRET);
                await QueryDBp(`INSERT INTO song_info (song_id, song_name, artist_name, song_image) 
                                VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE 
                                song_name = VALUES(song_name), 
                                artist_name = VALUES(artist_name), 
                                song_image = VALUES(song_image)`, 
                                [song.song_id, spotifySongInfo.name, spotifySongInfo.artist.name, spotifySongInfo.image]);

                songInfoMap.set(song.song_id, {
                    id: song.song_id,
                    name: spotifySongInfo.name,
                    artist: { name: spotifySongInfo.artist.name },
                    image: spotifySongInfo.image,
                    song_state: song.song_state,
                    request_number: song.request_number
                });
            }
        }

        // Preparar la respuesta con la información combinada
        const result = Array.from(songInfoMap.values());
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//--------------SHOW REQUESTED SONGS ABRU------------------
const cacheCanciones = {};
const cacheTimers = {};


// Función para actualizar la interfaz con las canciones y gestionar el caché
async function actualizarInterfaz(partyId, res) {
    try {
        // Verificar si las canciones en el caché han expirado
        if (cacheCanciones[partyId] && cacheCanciones[partyId].tiempo && (Date.now() - cacheCanciones[partyId].tiempo) < tiempoExpiracion) {
            // Utilizar las canciones del caché en lugar de realizar una nueva solicitud
            res.json(cacheCanciones[partyId].canciones);
        } else {
            // Realizar una solicitud a la API de Spotify para obtener las canciones
            const rows = await QueryDBp(`SELECT song_id, song_state FROM songs WHERE party_id = ?`, [partyId]);

            const CLIENT_ID = process.env.clientId;
            const CLIENT_SECRET = process.env.clientSecret;

            // Usamos Promise.all para ejecutar en paralelo
            const songsPromises = rows.map(async row => {
                const songInfo = await fetchSongInfo(row.song_id, CLIENT_ID, CLIENT_SECRET);

                // Combina songInfo con song_state
                return {
                    ...songInfo,
                    song_state: row.song_state,
                };
            });

            const songsInfo = await Promise.all(songsPromises);

            // Actualizar el caché con las nuevas canciones y el tiempo actual
            cacheCanciones[partyId] = {
                canciones: songsInfo,
                tiempo: Date.now(),
            };

            // Enviar las canciones actualizadas a la interfaz
            res.json(songsInfo);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Ruta para obtener las canciones con manejo de caché y polling
app.get('/api/selectedsongsABRU/:party_id', (req, res) => {
    const partyId = req.params.party_id;

    // Actualizar la interfaz y gestionar el caché
    actualizarInterfaz(partyId, res);

    // Configurar un temporizador solo si no existe uno para este party_id
    if (!cacheTimers[partyId]) {
        cacheTimers[partyId] = setInterval(() => {
            actualizarInterfaz(partyId, res);
        }, 60000); // por ejemplo, cada 1 minuto
    }
});

// Ruta para limpiar el caché de una fiesta específica
app.post('/api/clearCache/:party_id', (req, res) => {
    const partyId = req.params.party_id;
    clearInterval(cacheTimers[partyId]);
    delete cacheTimers[partyId];
    delete cacheCanciones[partyId];
    res.sendStatus(200);
});



//-------------Accept/reject song route (dj only)--------------  OK (hacer dos rutas)pasar id por param api/:song_id/accept

//accept
app.post('/api/B/:song_id/:party_id/accept', authenticateToken, async (req, res) => {
        const party_id =   req.params.party_id;
        const song_id =  req.params.song_id;

    // Verifica que song_id y song_state estén presentes
    if (!song_id || !party_id) {
        return res.status(400).json({ error: "Both song_id and party_id are required" });
    }

    // Actualiza el estado de la canción en la base de datos
    await QueryDBp(`UPDATE songs SET song_state = 'accepted' WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);
    res.sendStatus(200);
});

//reject
app.post('/api/B/:song_id/:party_id/reject', authenticateToken, async (req, res) => {
    const party_id =   req.params.party_id;
    const song_id =  req.params.song_id;

// Verifica que song_id y song_state estén presentes
if (!song_id || !party_id) {
    return res.status(400).json({ error: "Both song_id and party_id are required" });
}

// Actualiza el estado de la canción en la base de datos
await QueryDBp(`UPDATE songs SET song_state = 'rejected' WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);
res.sendStatus(200);
});


// --------- Update tokens route (rotation and reuse detection) -----------
app.post('/api/token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).send('No refresh token');

    try {
        // Combinar consultas: Obtener el token y verificar su validez en una sola consulta
        const tokenData = await QueryDBp('SELECT * FROM refresh_tokens WHERE token = ? AND expiry_date > NOW()', [refreshToken]);

        if (tokenData[0].length === 0) {
            return res.status(403).send('Invalid or expired refresh token');
        }

        const tokenRecord = tokenData[0][0];

        // Generar nuevos tokens
        const newAccessToken = jwt.sign({ userId: tokenRecord.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
        const newRefreshToken = crypto.randomBytes(40).toString('hex');

        // Actualizar tokens en la DB
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 5);
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        await QueryDBp('UPDATE refresh_tokens SET token = ?, expiry_date = ? WHERE family_token = ?', [newRefreshToken, formattedDate, tokenRecord.family_token]);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        // Manejo de errores simplificado
        console.error(error);
        return res.status(500).send('Server error');
    }
});



// -----------------Informacion perfil dj---------------------
app.get('/api/PerfilDJ/:party_id', async (req, res) => {
    try {
        const party_id = req.params.party_id;
        const [dj] = await QueryDBp(`SELECT username FROM party WHERE party_id = ?`, [party_id]);
        const username = dj[0].username;
        
        const stats = await getDJSongsStats(username);
        const songIds = await getAcceptedSongIds(username);
        const genres = await getGenresFromSpotify(songIds);

        const genreList = [].concat(...Object.values(genres)); 
        const dominantGenre = findDominantGenre(genres);
        console.log("Género dominante:", dominantGenre); // Agregar para depuración

        res.json({ ...stats, dominantGenre });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// Start server
app.get('/', (req, res) => {
    res.send('Bienvenido a mi API');
  });
  
 app.listen(PORT, () => {
     console.log(`App listening on port ${PORT}!`);
 });
 module.exports = app;
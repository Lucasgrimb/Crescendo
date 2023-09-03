/*
Endpoints: 
/api/register
const { userName, password } = req.body;

/api/login
 const { userName, password } = req.body;

/api/store-song-request
 const { songId } = req.body;

/api/selectedsongs
authenticatetoken

/api/update-song-state
const { songId, song_state} = req.body;
authenticatetoken

/api/token
const refreshToken = req.body.refreshToken;

/api/generate-qr
let url = "https://www.youtube.com";
*/

/* que tengo que hacer para mañana? 

- resolver el tema de iniciar fiesta 

- no se que mas... */




// ---------- REQUIRES ----------
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { fetchSongInfo, isValidSongOnSpotify } = require('./spotify');
const { QueryDB, QueryDBp } = require("./SQL");
require("dotenv").config()
const QRCode = require('qrcode');
const cors = require("cors")
const cookieParser = require('cookie-parser');
// const { createCanvas, loadImage } = require('canvas');


// ---------- APP SETUP ----------
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.use(cors({origin: "http://localhost:5500", credentials: true}))
app.use((req, res, next)=>{
req.header("Access-Control-Allow-Origin", req.headers.origin);
res.header(
    "access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Lenght, X-Requested-With, Set-Cookie"
);
res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
);
res.header("Access-Control-Allow-Credentials", true);
res.header("Access-Control-Expose-Headers", "Set-Cookie");
next();
});
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
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ error: "Both username and password are required" });
        }
        
        const existingUser = await QueryDBp("SELECT * FROM users WHERE username = ?", [userName]);
        if (existingUser[0].length > 0) {
            return res.status(400).json({ error: "Username already in use" });
        }

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
        error: "Incorrect password"
    });
}

//creo access y refresh token 
const accessToken = jwt.sign({ userId: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
const refreshToken = crypto.randomBytes(40).toString('hex');

// Almacenar el refresh token en la base de datos con su fecha de vencimiento
const currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 5); // Añade 5 hora
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
const sql = `INSERT INTO refresh_tokens (token, username, expiry_date) VALUES ('${refreshToken}', '${user.username}', '${formattedDate}')`;
//Me comunico con la base de datos para guardar refresh token
await QueryDBp(sql);


// Configura la respuesta para enviar la cookie httpOnly con el refresh token
res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),  // Expira en 24 horas
    secure: process.env.NODE_ENV !== 'development',     // Establece la cookie como 'secure' si no estás en modo desarrollo
    sameSite: 'strict'                                 // Establece la política de SameSite
});

res.status(200).json({ 
    message: 'Login successful', accessToken
});
});


//-----------------Iniciar Fiesta----------------------

app.get('/api/startparty', authenticateToken, async (req, res) => {
    const username = req.userId; 

    try {
        // Primero verificar si el usuario ya tiene una fiesta
        const [existingParties] = await QueryDBp('SELECT party_id FROM party WHERE username = ?', [username]);
        
        if(existingParties.length > 0) {
            // Ya tiene una fiesta, así que devolvemos esa
            const party_id = existingParties[0].party_id;
            const url = `http://localhost:5500/User's%20view/Elegi%20cancion.html?party_id=${party_id}`;
            const qr = await QRCode.toDataURL(url);

            return res.json({
                success: true,
                message: 'Fiesta existente',
                party_id: party_id,
                qr_code: qr
            });
        }

        // Si no tiene una fiesta, creamos una
        const [result] = await QueryDBp('INSERT INTO party (username) VALUES (?)', [username]);
        
        if(result.affectedRows > 0) {
            const party_id = result.insertId;
            const url = `http://localhost:5500/User's%20view/Elegi%20cancion.html?party_id=${party_id}`;
            const qr = await QRCode.toDataURL(url);

            res.json({
                success: true,
                message: 'Party iniciada con éxito',
                party_id: party_id,
                qr_code: qr
            });
        } else {
            res.status(500).json({ error: 'No se pudo iniciar la party' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});






//-----------------Request song route------------------   OK
//Le pasas el id de la canción seleccionada a la base de datos. 
app.post('/api/store-song-request', async (req, res) => {
    
    const song = {
        songId: req.body.songId,
        party_id: req.body.party_id,
    }

    if (!song.songId || !song.party_id) {
        return res.status(400).json({ error: "songId and party_id are required " });
    }

    const CLIENT_ID = process.env.clientId;
    const CLIENT_SECRET = process.env.clientSecret;

    const isValid = await isValidSongOnSpotify(song.songId, CLIENT_ID, CLIENT_SECRET);

    if (!isValid) {
        return res.status(400).json({ error: "Invalid songId" });
    }

    // Verificar el estado actual del songId en la base de datos
    const currentSong = await QueryDBp(`SELECT song_state FROM songs WHERE song_id = ? AND party_id = ?`, [song.songId, song.party_id]);

    if (currentSong[0] && currentSong[0].length) {
        const songState = currentSong[0][0].song_state;

        if (songState === 'accepted' || songState === 'hold') {
            return res.status(400).json({ error: "La canción ya ha sido solicitada y está " + songState });
        } else {
            // Si la canción fue previamente rechazada, actualiza su estado a 'hold'
            await QueryDBp(`UPDATE songs SET song_state = ?  WHERE song_id = ? AND party_id = ?`, ['hold', song.songId, song.party_id]);
            return res.status(200).json({ message: 'OK' });

        }
    } else {
        // Si no está en la base de datos, guarda el ID en la base de datos con estado 'hold'
        await QueryDBp(`INSERT INTO songs (song_id, song_state, party_id) VALUES (?, ?, ?)`, [song.songId, 'hold', song.party_id]);
        return res.status(200).json({ message: 'OK' });

    }
});




//---------------Show requested songs (dj only)------------------  OK
app.get('/api/selectedsongs/:party_id', authenticateToken, async (req, res) => {
   const party_id = req.params.party_id;

    const [rows] = await QueryDBp(`SELECT song_id FROM songs WHERE party_id = ?`, [party_id]);

    const songIds = rows.map(row => row.song_id);

    const CLIENT_ID = process.env.clientId;
    const CLIENT_SECRET = process.env.clientSecret;

    // Utilizamos Promise.all para obtener las canciones en paralelo.
    const songsInfo = await Promise.all(songIds.map(songId => fetchSongInfo(songId, CLIENT_ID, CLIENT_SECRET)));

    // Puedes responder con el array songsInfo si quieres.
    res.json(songsInfo);
});



//-------------Accept/reject song route (dj only)--------------  OK (hacer dos rutas)pasar id por param api/:songId/accept

//accept
app.post('/api/:songId/:party_id/accept', authenticateToken, async (req, res) => {
        const party_id =   req.params.party_id;
        const songId =  req.body.songId;

    // Verifica que songId y songState estén presentes
    if (!songId || !party_id) {
        return res.status(400).json({ error: "Both songId and party_id are required" });
    }

    // Actualiza el estado de la canción en la base de datos
    await QueryDBp(`UPDATE songs SET song_state = 'accepted' WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);
    res.sendStatus(200);
});

//reject
app.post('/api/:songId/:party_id/reject', authenticateToken, async (req, res) => {
    const party_id =   req.params.party_id;
    const songId =  req.body.songId;

// Verifica que songId y songState estén presentes
if (!songId || !party_id) {
    return res.status(400).json({ error: "Both songId and party_id are required" });
}

// Actualiza el estado de la canción en la base de datos
await QueryDBp(`UPDATE songs SET song_state = 'rejected' WHERE song_id = ? AND party_id = ?`, [song_id, party_id]);
res.sendStatus(200);
});

//------------ Update tokens route (jd only)--------------------  OK
app.post('/api/token', async (req, res) => {
    var refreshToken = req.cookies.refreshToken; // Obtener el refresh token de la cookie
    
    if (!refreshToken) {
      return res.sendStatus(401); // No autorizado
    }
  
    let tokenData;
    try {
      // Aquí deberías buscar el refresh token en tu base de datos
      // y obtener los datos asociados al token (como el username y la fecha de expiración)
      tokenData = await QueryDBp('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
      

      
    } catch (error) {
      return res.sendStatus(500); // Error interno del servidor
    }
  
    // Comprueba si el token ha expirado
    if (new Date(tokenData.expiry_date) < new Date()) {      
      await QueryDBp('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
      return res.sendStatus(403); // Prohibido
    }
  
    // Crea un nuevo access token
    const accessToken = jwt.sign({ userId: tokenData[0][0].username }, process.env.SECRET_KEY, { expiresIn: '5m' });
    
    // Crea un nuevo refresh token
    refreshToken = crypto.randomBytes(40).toString('hex');
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1);
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  
    // Actualiza el refresh token en la base de datos
    await QueryDBp('UPDATE refresh_tokens SET token = ?, expiry_date = ? WHERE username = ?', [refreshToken, formattedDate, tokenData[0][0].username]);
  
    // Actualiza la cookie con el nuevo refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24 horas
      secure: process.env.NODE_ENV !== 'development', // Asegura la cookie si no estamos en modo de desarrollo
      sameSite: 'strict' // Política SameSite
    });
  
    // Envía el nuevo access token
    res.json({ accessToken});
  });
  


// Start server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});
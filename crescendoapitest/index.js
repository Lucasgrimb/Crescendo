express = require("express");
const spotify = require("./spotify")
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { fetchSongInfo } = require('./spotify');
const { QueryDB } = require("./SQL");
const { QueryDBp } = require("./SQL");
app.use(express.json());




//Register: 
//Guardo en la base de datos username y contraseña (Y id). Me fijo que no este repetido. 
app.post('/api/register', async (req, res) => {
    const userDj = {
        userName: req.body.userName,
        password: req.body.password,
    }
    if (!userDj.userName || !userDj.password) {
        return res.status(400).json({
            error: "Both username and password are required"
        });
    }
    
    const result = await QueryDBp(`SELECT * FROM users WHERE username = ?`,[userDj.userName]);

    if(result[0].length > 0){
        return res.status(400).json({
            error: "Username already in use"
        });
    }
    const hashedPassword = await bcrypt.hash(userDj.password, 10);
    await QueryDBp(`INSERT INTO users (username, password) VALUES (?, ?)`, [userDj.userName, hashedPassword]);
    res.sendStatus(200);  
});


//Login:  
//establesco los datos que me tiene que pasar el usuario en un objeto llamado logdj
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
const accessToken = jwt.sign({ userId: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
const refreshToken = crypto.randomBytes(40).toString('hex');

// Almacenar el refresh token en la base de datos con su fecha de vencimiento
const currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 5); // Añade 5 hora
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
const sql = `INSERT INTO refresh_tokens (token, user_id, expiry_date) VALUES ('${refreshToken}', '${user.user_id}', '${formattedDate}')`;
//Me comunico con la base de datos para guardar refresh token
await QueryDBp(sql);


//devuelvo access y refresh token
res.json({ accessToken, refreshToken });

});


//Pedir canción: 
//Le pasas el id de la canción seleccionada a la base de datos. 
app.post('/api/selectsong', authenticateToken, async(req, res) => {
    const songReq = {
        songId: req.body.songId,
    }
    await QueryDBp(`INSERT INTO songs (song_id, song_state) VALUES ('${songReq.songId}', '${"pendiente"}')`);
    res.sendStatus(200);

    
});




//Pedir canciones pedidas (dj):
//La api busca la cancion en spotify con el id, y le muestra al dj los resultados de la api de Spotify (foto, nombre, artista, genero)


app.get('/api/selectedsongs', authenticateToken, async (req, res) => {
    const [rows] = await QueryDB('SELECT song_id FROM songs');
    const songIds = rows.map(row => row.song_id);

    const CLIENT_ID = process.env.clientId;
    const CLIENT_SECRET = process.env.clientSecret;

    // Utilizamos Promise.all para obtener las canciones en paralelo.
    const songsInfo = await Promise.all(songIds.map(songId => fetchSongInfo(songId, CLIENT_ID, CLIENT_SECRET)));

    // Puedes responder con el array songsInfo si quieres.
    res.json(songsInfo);
});






//Aceptar/rechazar canción:
//Cambias el estado de la canción en la db (pendiente, aceptada, rechazada)

app.post('/api/songstate',authenticateToken, (req, res) => {
    const songReq = {
        songId: req.body.songId,
        songState: req.body.songState,
    }
    res.sendStatus(200);
});



//actualizar token 
app.post('/api/token', async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) return res.sendStatus(401);


    const storedTokenData = await QueryDBp(`SELECT * FROM refresh_tokens WHERE token = ?`, [refreshToken]);

    if (storedTokenData[0].length == 0) return res.sendStatus(403);

    const tokenData = storedTokenData[0][0];

    // Comprueba si el token ha expirado
    if (new Date(tokenData.expiry_date) < new Date()) {
        await QueryDBp(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]); // Borra el token expirado
        return res.sendStatus(403);
    }
 
    const accessToken = jwt.sign({ userId: tokenData.user_id }, process.env.SECRET_KEY, { expiresIn: '5m' });


    //creo un nuevo refresh token 
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 1); // Añade 1 hora
    const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    // Actualizo refresh token
     await QueryDBp(`UPDATE refresh_tokens SET token = ?, expiry_date = ? WHERE user_id = ?`, [newRefreshToken, formattedDate, tokenData.user_id]);

     
 

    //muestro access y refresh token 
    res.json({ accessToken, newRefreshToken });
});




//funcion que uso despues como MIDDLEWARE
function authenticateToken(req, res, next) {
    // Extraer el encabezado de autorización
    const authHeader = req.headers['authorization'];

    // Extraer el token del encabezado (espera un formato "Bearer TOKEN")
    const token = authHeader && authHeader.split(' ')[1];

    // Si no hay token, devuelve un 401 Unauthorized
    if (!token) return res.sendStatus(401);

    // Verificar el token
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        // Si hay un error (token inválido o expirado), devuelve un 403 Forbidden
        if (err) return res.sendStatus(403);

        // Si el token es válido, coloca el payload en req.user
        req.user = user;

        // Continuar con el siguiente middleware o función de ruta
        next();
    });
}


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});


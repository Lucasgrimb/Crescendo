// ---------- REQUIRES ----------
const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { fetchSongInfo, isValidSongOnSpotify } = require('./spotify');
const { QueryDB, QueryDBp } = require("./SQL");



// ---------- APP SETUP ----------
const app = express();
app.use(express.json());
const PORT = 3000;

// ---------- MIDDLEWARE ----------
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
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
        res.sendStatus(200); 
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
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
const accessToken = jwt.sign({ userId: user.user_id }, process.env.SECRET_KEY, { expiresIn: '1h' });
const refreshToken = crypto.randomBytes(40).toString('hex');

// Almacenar el refresh token en la base de datos con su fecha de vencimiento
const currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 5); // Añade 5 hora
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
const sql = `INSERT INTO refresh_tokens (token, user_id, expiry_date) VALUES ('${refreshToken}', '${user.user_id}', '${formattedDate}')`;
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
    message: 'Login successful',
    accessToken: accessToken 
});
});



//-----------------Request song route------------------   NOT READY (falta ver que pasa cuando se repiten las canciones pedidas)
//Le pasas el id de la canción seleccionada a la base de datos. 
app.post('/api/store-song-request', async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
        return res.status(400).json({ error: "songId is required" });
    }

    const CLIENT_ID = process.env.clientId;
    const CLIENT_SECRET = process.env.clientSecret;

    const isValid = await isValidSongOnSpotify(songId, CLIENT_ID, CLIENT_SECRET);

    if (!isValid) {
        return res.status(400).json({ error: "Invalid songId" });
    }

    // Si es válido, guarda el ID en la base de datos
    await QueryDBp(`INSERT INTO songs (song_id, song_state) VALUES (?, ?)`, [songId, 'pendiente']);
    res.sendStatus(200);
});




//---------------Show requested songs (dj only)------------------  OK
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



//-------------Accept/reject song route (dj only)--------------  OK

//Cambias el estado de la canción en la db (pendiente, aceptada, rechazada)
app.post('/api/update-song-state', authenticateToken, async (req, res) => {
    const song = {
        songId: req.body.songId,
        password: req.body.songState,
    }

    // Verifica que songId y songState estén presentes
    if (!song.songId || !song.songState) {
        return res.status(400).json({ error: "Both songId and songState are required" });
    }

    // Verifica que songState sea uno de los tres valores permitidos
    const validStates = ["hold", "accepted", "rejected"];
    if (!validStates.includes(song.songState)) {
        return res.status(400).json({ error: "Invalid songState value" });
    }

    // Actualiza el estado de la canción en la base de datos
    await QueryDBp("UPDATE songs SET song_state = ? WHERE song_id = ?", [songState, songId]);
    res.sendStatus(200);
});


//------------ Update tokens route (jd only)--------------------  OK
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

    // Configura la respuesta para enviar la cookie httpOnly con el refresh token
    res.cookie('newRefreshToken', newRefreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),  // Expira en 24 horas
    secure: process.env.NODE_ENV !== 'development',     // Establece la cookie como 'secure' si no estás en modo desarrollo
    sameSite: 'strict'                                 // Establece la política de SameSite
});
 

    //muestro access y refresh token 
    res.json({ accessToken });
});


// Start server
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

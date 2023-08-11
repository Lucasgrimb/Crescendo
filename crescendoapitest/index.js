express = require("express");
const GetAll = require("./SQL");
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

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
    
    const result = await GetAll.QueryDBp(`SELECT * FROM users WHERE username = ?`,[userDj.userName]);

    if(result[0].length > 0){
        return res.status(400).json({
            error: "Username already in use"
        });
    }
    const hashedPassword = await bcrypt.hash(userDj.password, 10);
    await GetAll.QueryDBp(`INSERT INTO users (username, password) VALUES (?, ?)`, [userDj.userName, hashedPassword]);
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
const result = await GetAll.QueryDBp(`SELECT * FROM users WHERE username = ?`, [logdj.userName]);

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
currentDate.setHours(currentDate.getHours() + 1); // Añade 1 hora
const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
const sql = `INSERT INTO refresh_tokens (token, user_id, expiry_date) VALUES ('${refreshToken}', '${user.user_id}', '${formattedDate}')`;
//Me comunico con la base de datos para guardar refresh token
await GetAll.QueryDBp(sql);


//devuelvo access y refresh token
res.json({ accessToken, refreshToken });

});


//Pedir canción: 
//Le pasas el id de la canción seleccionada a la base de datos. 
app.post('/api/selectsong', (req, res) => {
    const songReq = {
        songId: req.body.songId,
    }
    res.sendStatus(200);
});

//Pedir canciones pedidas (dj):
//La api busca la cancion en spotify con el id, y le muestra al dj los resultados de la api de Spotify (foto, nombre, artista, genero)

app.get('/api/selectedsongs',authenticateToken, (req, res) => {
    const Rsongs = {
        songId: req.body.songId,
    }
    
    res.sendStatus(200)
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
    const refreshToken = req.body.token;

    if (!refreshToken) return res.sendStatus(401);

    const storedTokenData = await GetAll.QueryDBp(`SELECT * FROM refresh_tokens WHERE token = ?`, [refreshToken]);

    if (storedTokenData[0].length == 0) return res.sendStatus(403);

    const tokenData = storedTokenData[0][0];

    // Comprueba si el token ha expirado
    if (new Date(tokenData.expiry_date) < new Date()) {
        await GetAll.QueryDBp(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]); // Borra el token expirado
        return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ userId: tokenData.user_id }, process.env.SECRET_KEY, { expiresIn: '5m' });

    // Como es de uso único, borra el token de refresco después de su uso
    await GetAll.QueryDBp(`DELETE FROM refresh_tokens WHERE token = ?`, [refreshToken]);

    res.json({ accessToken });
});


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

const mysql = require("mysql2/promise");

require('dotenv').config();






//a esta funcion hay que pasarle parametros (ES MAS PARA UN POST)
// Crear un pool de conexiones fuera de la función.
// Crear un pool de conexiones fuera de la función.
const pool = mysql.createPool({
    connectionLimit: 10, // El número de conexiones puede ser ajustado según tus necesidades
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "crescendo",
    ssl: {
        rejectUnauthorized: true
    }
});

async function QueryDBp(query, params) {
    try {
        // Usar el pool para obtener una conexión y ejecutar la consulta
        const [rows, fields] = await pool.promise().execute(query, params);
        return [rows, fields];
    } catch (error) {
        // Manejar el error como consideres apropiado
        console.error('Error en QueryDBp:', error);
        throw error; // O manejarlo de otra manera
    }
}


 
// A esta funion no se le pasan parametros (mas para un get)

async function QueryDB(query) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: "crescendo",
        ssl: {
            rejectUnauthorized: true
        }
    });
     
    let [rows, fields] = await connection.execute(query)
    return [rows, fields]
}

module.exports = {
    QueryDBp: QueryDBp,
    QueryDB: QueryDB
};



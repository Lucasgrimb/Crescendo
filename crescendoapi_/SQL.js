const mysql = require("mysql2/promise");

require('dotenv').config();






//a esta funcion hay que pasarle parametros (ES MAS PARA UN POST)
// Crear un pool de conexiones fuera de la función.
// Crear un pool de conexiones fuera de la función.

// Crear un pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "crescendo",
    ssl: {
        rejectUnauthorized: true
    }
    // Puedes agregar más configuraciones como connectionLimit, etc.
});

async function QueryDBp(query, params) {
    try {
        const [rows, fields] = await pool.execute(query, params);
        return [rows, fields];
    } catch (error) {
        console.error('Error en QueryDBp:', error);
        throw error;
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



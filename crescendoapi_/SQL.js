const mysql = require("mysql2/promise");

require('dotenv').config();






//a esta funcion hay que pasarle parametros (ES MAS PARA UN POST)
// Crear un pool de conexiones fuera de la función.
// Crear un pool de conexiones fuera de la función.



 
// A esta funion no se le pasan parametros (mas para un get)

async function QueryDB(query) {
    const connection = await mysql.createConnection({
        connectionLimit: 10,
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



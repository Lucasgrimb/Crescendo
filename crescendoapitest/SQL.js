const mysql = require("mysql2/promise");

require('dotenv').config();






//a esta funcion hay que pasarle parametros (ES MAS PARA UN POST)
async function QueryDBp(query, params) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "crescendo",
        ssl: {
            rejectUnauthorized: true
        }
    });

    try {
        let [rows, fields] = await connection.execute(query, params);
        return [rows, fields];
    } finally {
        // Asegúrate de cerrar la conexión, sin importar si hubo un error o no.
        await connection.end();
    }
}

 
// A esta funion no se le pasan parametros (mas para un get)

async function QueryDB(query) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
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



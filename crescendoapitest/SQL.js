const mysql = require("mysql2/promise");
require('dotenv').config();


function connect() {
    connection.connect((err) => {
        if (err) {
            console.error("Error conectándose: " + err);
            return;
        }
        
        console.log("Base de datos conectada");
    });
}



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
     
    let [rows, fields] = await connection.execute(query, params)
    return [rows, fields]
}
module.exports = { QueryDBp }



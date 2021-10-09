const mysql = require("mysql2");
module.exports = (/*client, type*/) => {
    //if (type !== "mysql") return client.log.warn(`${type} db type is not supported for database creation. Currently only mysql is supported`);
    const conn = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password : process.env.DB_PASS,
    });
    conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    return true;
};

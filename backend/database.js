require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;

function initDb() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0,
        });
    }

    return pool;
}

async function getDbConnection() {
    try {
        const pool = initDb();
        return pool;
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw new Error("Database connection failed");
    }
}

async function closePool() {
    if (pool) {
        await pool.end();
    }
}

module.exports = {
    getDbConnection,
    closePool,
};

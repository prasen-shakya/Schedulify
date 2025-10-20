require("dotenv").config();
const mysql = require("mysql2");
const { Client } = require("ssh2");

let sshClient;
let connection;

async function createSshTunnel() {
  return new Promise((resolve, reject) => {
    const client = new Client();

    client.on("ready", () => {
      client.forwardOut(
        "127.0.0.1",
        3307,
        process.env.DB_HOST,
        process.env.DB_PORT,
        (err, stream) => {
          if (err) return reject(err);

          connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            stream,
            connectionLimit: 10,
          });

          console.log("✅ SSH Tunnel + DB Pool ready");
          sshClient = client;
          resolve(connection);
        }
      );
    });

    client.on("error", (err) => reject(err));
    client.connect({
      host: process.env.SSH_HOST,
      port: Number(process.env.SSH_PORT),
      username: process.env.SSH_USER,
      password: process.env.SSH_PASSWORD,
      tryKeyboard: true,
    });
  });
}

async function getDbConnection() {
  if (!connection) {
    await createSshTunnel();
  }
  return connection.promise(); // Enables async/await queries
}

module.exports = { getDbConnection };

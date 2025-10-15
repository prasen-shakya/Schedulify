require('dotenv').config();
const fs = require('fs');
const mysql = require("mysql2");
const {Client} = require("ssh2");

const sshClient = new Client();


const sshConfig = {
    host: process.env.SSH_HOST,
    port: Number(process.env.SSH_PORT),
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD,
    tryKeyboard: true,
};

const dbServer = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const forwardConfig = {
    srcHost: "127.0.0.1",
    srcPort: 3307,
    dstHost: dbServer.host,
    dstPort: dbServer.port,

}


function connectViaSSH() {
    return new Promise((resolve, reject) => {
        sshClient
            .on('ready', () => {
                sshClient.forwardOut(
                    forwardConfig.srcHost,
                    forwardConfig.srcPort,
                    forwardConfig.dstHost,
                    forwardConfig.dstPort,
                    (err, stream) => {
                        if (err) return reject(err);

                        const updatedDbServer = {
                            ...dbServer,
                            stream,
                        };

                        const connection = mysql.createConnection(updatedDbServer);

                        connection.connect((dbErr) => {
                            if (dbErr) {
                                reject(dbErr);
                            } else {
                                console.log('Connected successfully!!');
                                resolve(connection);
                            }
                        });
                    }
                );
            })
            .on('error', reject)
            .connect(sshConfig);
    });
}

module.exports = connectViaSSH;

const express = require("express");
const app = express();
const port = 3000;
const connectViaSSH = require("./db");

//testing database connection
(async () => {
    try {
        const connection = await connectViaSSH();
        const [rows] = await connection.promise().query('SELECT * FROM User WHERE Name = "Myles"');
        console.log(rows);
        connection.end();
    } catch (err) {
        console.error('Connection error:', err);
    }
})();



app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(port, () => {
    console.log(`Listening on PORT ${3000}`);
});


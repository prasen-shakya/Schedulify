const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    // This is homepage stuff
});

app.get("/login", (req, res) => {
    // this is login stuff
});

app.get("/events", (req, res) => {
    // this is event stuff
});

app.get("/availability", (req, res) => {
    // this is availability stuff
});

app.get("/invite", (req, res) => {
    // this is for inviting others into an event
});

app.listen(port, () => {
    console.log("Listening on port " + port);
});

app.listen(port, () => {
    console.log('Example app listening on port ${port}');
});
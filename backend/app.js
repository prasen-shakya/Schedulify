const cors = require("cors");
const express = require("express");
const { getDbConnection } = require("./database");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Test connection once on startup
(async () => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.query(
      'SELECT * FROM User WHERE Name = "Test"'
    );
    console.log("✅ Test query result:", rows);
  } catch (err) {
    console.error("❌ Connection error:", err);
  }
})();

// Example route
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
});

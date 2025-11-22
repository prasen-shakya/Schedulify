require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const { closePool } = require("../backend/config/database");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();
const port = process.env.PORT || 3000;

const buildPath = path.join(path.dirname(__dirname), "frontend/dist");

app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static(buildPath));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
}

app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", availabilityRoutes);

if (process.env.NODE_ENV !== "testing") {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

module.exports = app;

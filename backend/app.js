const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getDbConnection } = require("./database");
const { uuid } = require("uuidv4");

const app = express();
const port = 3000;

const JWT_SECRET = "jwt-secret";

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      sameSite: "lax",
    });
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const db = await getDbConnection();

    // Check if email exists
    const [emailRows] = await db.query("SELECT * FROM User WHERE Email = ?", [
      email,
    ]);
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Insert new user
    await db.query(
      "INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const [rows] = await db.query("SELECT * FROM User WHERE Email = ?", [
      email,
    ]);

    const user = rows[0];

    // Generate access token
    const accessToken = jwt.sign({ userId: user.UserID }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // use true if HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("Registered user:", { name, email, hashedPassword });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await getDbConnection();

    // Check if the user exists
    const [rows] = await db.query("SELECT * FROM User WHERE Email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    // Compare entered password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate access token
    const accessToken = jwt.sign({ userId: user.UserID }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // use true if HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully." });
});

app.get("/api/checkAuthenticationStatus", authenticateToken, (req, res) => {
  res.status(200).json({ userId: req.user.userId, message: "Authenticated" });
});

app.post("/api/createEvent", authenticateToken, async (req, res) => {
  try {
    // Get inputs from the request
    const { name, description, startDate, endDate, startTime, endTime } =
      req.body;
    const organizerID = req.user.userId;
    const eventID = uuid();

    // Check that name is less than 20 characters
    if (name.length > 20) {
        return res.status(400).json({ error: "Name must be less than 20 characters." });
    }

    // Check that description is less than 150 characters
    if (description.length > 150) {
        return res.status(400).json({ error: "Description must be less than 150 characters!" });
    }

    // Convert dates and times to Date objects for comparison
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    // Check that end time is not before start time
    if (end < start) {
        return res.status(400).json({ error: "End time cannot be before start time!" });
    }

    // Connect to the database
    const connection = await getDbConnection();

    // Attempt to insert the new event into the database
    const [result] = await connection.query(
      "INSERT INTO Event (EventID, OrganizerID, Name, Description, StartDate, EndDate, StartTime, EndTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        eventID,
        organizerID,
        name,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
      ]
    );

    // Respond with event ID
    res.status(201).json({ eventID: eventID });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.get("/api/getEvent/:eventId", authenticateToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    const db = await getDbConnection();

    const [rows] = await db.query("SELECT * FROM Event WHERE EventID = ?", [
      eventId,
    ]);

    console.log(rows[0]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`🚀 Listening on port ${port}`);
});

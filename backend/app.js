const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getDbConnection, closePool } = require("./database");
const { uuid } = require("uuidv4");
const path = require("path");
const { groupEnd } = require("console");

const app = express();
const port = process.env.PORT || 3000;

const buildPath = path.join(path.dirname(__dirname), "frontend/dist");

const jwtSecret = process.env.JWT_SECRET || "jwttoken";

app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV == "production") {
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

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
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

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const db = await getDbConnection();

    // Check if email exists
    const [emailRows] = await db.query("SELECT * FROM User WHERE Email = ?", [email]);
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Insert new user
    await db.query("INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

    const [rows] = await db.query("SELECT * FROM User WHERE Email = ?", [email]);

    const user = rows[0];

    // Generate access token
    const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false, // use true if HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
    const [rows] = await db.query("SELECT * FROM User WHERE Email = ?", [email]);
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
    const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
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
    const { name, description, startDate, endDate, startTime, endTime } = req.body;
    const organizerID = req.user.userId;
    const eventID = uuid();

    // Check that name is less than 20 characters
    if (name.length > 20) {
      return res.status(400).json({ error: "Name must be less than 20 characters." });
    }

    // Check that description is less than 150 characters
    if (description.length > 150) {
      return res.status(400).json({
        error: "Description must be less than 150 characters!",
      });
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
      [eventID, organizerID, name, description, startDate, endDate, startTime, endTime]
    );

    // Respond with event ID
    res.status(201).json({ eventID: eventID });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

async function insertAvailability(userID, eventID, availabilitySlots) {
  // get connection to database
  const pool = await getDbConnection();
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  if (availabilitySlots.length === 0) {
    return "availbilitySlots is empty, inserted nothing.";
  }

  try {
    for (let i = 0; i < availabilitySlots.length; i++) {
      const { day, start, end } = availabilitySlots[i];

      // validate inputs
      // Convert dates and times to Date objects for comparison
      const startTime = new Date(`${availabilitySlots[i].day}T${availabilitySlots[i].start}`);
      const endTime = new Date(`${availabilitySlots[i].day}T${availabilitySlots[i].end}`);

      // Check that end time is not before start time
      if (endTime < startTime) {
        throw new Error(`Availability ${i + 1}: End time cannot be before start time!`);
      }

      //generate ID
      const availabilityID = uuid();

      //create inserts
      const [result] = await connection.query(
        "INSERT INTO Availability (AvailabilityID, UserID, EventID, Date, StartTime, EndTime) VALUES (?, ?, ?, ?, ?, ?)",
        [availabilityID, userID, eventID, day, start, end]
      );
    }

    // apply inserts to database
    await connection.commit();

    const message = "All availabilities successfully inserted.";

    //direct connection needs release (end), unlike pools
    connection.release();
    return message;
  } catch (error) {
    //avoid committing messages
    await connection.rollback();

    //direct connection needs release (end), unlike pools
    connection.release();
    return error.message;
  }
}

async function deleteAvailability(eventID, userID) {
  try {
    // get connection to database
    const pool = await getDbConnection();
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    //only one query to delete all
    const [result] = await connection.query("DELETE FROM Availability WHERE EventID = ? AND UserID = ?", [eventID, userID]);

    const message = "All availabilities successfully deleted.";

    connection.release();
    return message;
  } catch (error) {
    return error.message;
  }
}

app.post("/api/updateAvailability", authenticateToken, async (req, res) => {
  const { eventID, availability } = req.body;
  const userID = req.user.userId;

  //get all the date with start/end times
  const availabilitySlots = availability.flatMap((slot) =>
    slot.times.map((time) => ({
      day: slot.selectedDate,
      start: time.startTime,
      end: time.endTime,
    }))
  );

  //inserts
  try {
    //get database connection
    const connection = await getDbConnection();
    const [existing] = await connection.query("SELECT * FROM EventParticipants WHERE EventID = ? AND UserID = ?", [eventID, userID]);

    // if no duplicates, insert into EventParticipants (participant is not apart of the event)
    if (existing.length === 0) {
      await connection.query("INSERT INTO EventParticipants (EventID, UserID) VALUES (?, ?)", [eventID, userID]);
    } else {
      await deleteAvailability(eventID, userID);
    }

    //insert the new availblity given.
    const insertResponse = await insertAvailability(userID, eventID, availabilitySlots);

    //return status
    res.status(201).json({ message: insertResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/getAvailability/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    // get db connection
    const connection = await getDbConnection();

    // query is in a variable for readability
    const query =
      "SELECT U.Name AS UserName,  U.UserID AS UserID, A.Date AS AvailabilityDate, A.StartTime, A.EndTime FROM User U JOIN Availability A ON U.UserID = A.UserID WHERE A.EventID = ? ORDER BY A.Date, A.StartTime;";

    // get results from db
    const [availabilities] = await connection.query(query, [eventId]);
    // console.log(availabilities);

    // format the availabilities by users for frontend
    const availabilitiesByUsers = orderAvailabilitiesByUser(availabilities);

    // respond with request sucessful and the availabilities ordered by users
    res.status(200).send(availabilitiesByUsers);
  } catch (error) {
    //respond with error and message
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

function orderAvailabilitiesByUser(availabilities) {
  const grouped = {};

  // go through each row in availabilities
  availabilities.forEach((row) => {
    const user = row.UserName;
    const id = row.UserID;
    const date = new Date(row.AvailabilityDate).toISOString().split("T")[0];

    // if user doesn't exist yet, add them
    if (!grouped[user]) {
      grouped[user] = { id, dates: {} };
    }

    // if date doesn't exist under that user yet, add it
    if (!grouped[user].dates[date]) {
      grouped[user].dates[date] = [];
    }

    // push time ranges
    grouped[user].dates[date].push({
      startTime: row.StartTime,
      endTime: row.EndTime,
    });
  });

  // convert the grouped object into format frontend wants
  const result = Object.entries(grouped).map(([user, data]) => ({
    user,
    userId: data.id,
    availability: Object.entries(data.dates).map(([date, times]) => ({
      date,
      times,
    })),
  }));

  return result;
}

app.get("/api/getUserAvailability/:eventId" , authenticateToken, async (req, res)=> {

  const {eventId} = req.params;
  const userID = req.user.userId;

  try{
    
    // get db connection
    const connection = await getDbConnection();

    // search in database for Availability with matching userID and eventID
    const [result] = await connection.query("SELECT Date, StartTime, EndTime FROM Availability WHERE EventID = ? AND UserID = ? ", [eventId, userID]);

    // to convert camelCase
    const toCamel = (str) => str.charAt(0).toLowerCase() + str.slice(1);

    // result returns date as a Time type, so to truncate and get just the actual date convert it to a sting 
    const formatResults = result.map(results => {
      const formatted = {};
      for (const key in results) {
        formatted[toCamel(key)] = results[key];
      }
      formatted.date = new Date(formatted.date).toISOString().slice(0, 10);
      return formatted;
    });

    res.status(200).send(formatResults);
  }
  catch(error)
  {
    //respond with error and message
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
  
});


app.get("/api/getEvent/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const db = await getDbConnection();

    const [rows] = await db.query("SELECT * FROM Event WHERE EventID = ?", [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.get("/api/getEventParticipants/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const connection = await getDbConnection();

    const [eventRows] = await connection.query("SELECT * FROM Event WHERE EventID = ?", [eventId]);

    if (eventRows.length === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    const [rows] = await connection.query(
      "SELECT User.UserID, User.Name FROM User JOIN EventParticipants ON User.UserID = EventParticipants.UserID WHERE EventID = ?",
      [eventId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting event participants.", err);
    res.status(400).json({ message: `Server error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

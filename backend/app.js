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

async function insertAvailability(userID, eventID, infoArray)
{
  // get connection to database
  const pool = await getDbConnection(); 
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {

    for (let i = 0; i < infoArray.length; i++)
    {
      const {day, start, end} = infoArray[i];

      // validate inputs
      // Convert dates and times to Date objects for comparison
      const startTime = new Date(`${infoArray[i].day}T${infoArray[i].start}`);
      const endTime = new Date(`${infoArray[i].day}T${infoArray[i].end}`);


      // Check that end time is not before start time
      if (endTime < startTime)
      {
        throw new Error(`Availability ${i + 1}: End time cannot be before start time!`);
      }


      //check for duplicate entries- duplicated being entries with the identical UserID, Date, startTime and endTimes;
      const [duplicates] = await connection.query(
      `SELECT * FROM Availability
      WHERE UserID = ? AND Date = ? 
      AND StartTime = ? AND EndTime = ?`,
      [userID, day, start, end]
      );


      if (duplicates.length > 0) 
      {
        throw new Error(`Availability ${i + 1}: is a duplicate`);
      }
      

      //generate ID
      const availabilityID = uuid();


      //create inserts
      const [result] = await connection.query("INSERT INTO Availability (AvailabilityID, UserID, EventID, Date, StartTime, EndTime) VALUES (?, ?, ?, ?, ?, ?)",
        [
          availabilityID,
          userID,
          eventID,
          day,
          start,
          end,
        ]);

    }

  // apply inserts to database
  await connection.commit();  


  // Respond with success message
  const returnStats = {
    message :"All availabilities successfully inserted.",
    status : 201
  };
  connection.release();
  return returnStats;
  } 
  catch (error) {
    //avoid committing messages
    await connection.rollback();


    //response 
    const returnStats = {
    message : error.message,
    status : 400
    };

    //direct connection needs release (end), unlike pools
    connection.release();
    return returnStats;

  }
}


async function deleteAvailability(eventID, userID)
{
  // get connection to database
  const pool = await getDbConnection(); 
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  //only one query to delete all 
  const [result] =  await connection.query("DELETE FROM Availability WHERE EventID = ? AND UserID = ?",
    [eventID, userID]);


  const returnStats = {
    message :"All availabilities successfully deleted.",
    status : 201
  };

  connection.release();
  return returnStats;

}


 app.post("/api/updateAvailability", authenticateToken, async (req, res) => {
  const {eventID, availability} = req.body;
  const userID = req.user.userId;
  

  //get all the date with start/end times
    const infoArray = req.body.availability.flatMap(slot =>
      slot.times.map(time => ({
        day: slot.selectedDate,
        start: time.startTime,
        end: time.endTime
    })));


    //inserts
    try {
      //get database connection
      const connection = await getDbConnection();
      const [existing] = await connection.query(
        "SELECT * FROM EventParticipants WHERE EventID = ? AND UserID = ?",
        [eventID, userID]
      );
 

    // if no duplicates, insert into EventParticipants (participant is not apart of the event)
    if (existing.length === 0) 
    {
      await connection.query(
        "INSERT INTO EventParticipants (EventID, UserID) VALUES (?, ?)",
        [eventID, userID]
      );
    }else
    {
      await deleteAvailability(eventID, userID);
    }
    
  
    //insert the new availblity given.
    const insertResponse = await insertAvailability(userID, eventID, infoArray);


    // check if everthing was inserted properly in insertAvailability
    if(insertResponse.status === 400)
    {
      throw new Error( (insertResponse).message );
    }
    

    //return status
    res.status(201).json({message :  "Inserts were successful!"});

  }
  catch (error)
  {
    res.status(400).json({ error: error.message});
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

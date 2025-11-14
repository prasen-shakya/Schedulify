const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getDbConnection, closePool } = require("./database");
const { uuid } = require("uuidv4");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const buildPath = path.join(path.dirname(__dirname), "frontend/dist");

const jwtSecret = process.env.JWT_SECRET || "jwttoken";

app.use(cookieParser());
app.use(express.json());
if (process.env.NODE_ENV != "production") {
    app.use(
        cors({
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true,
        })
    );
}

/*
Function that authenticates token for continued session
- retrieves cookie from request
- checks if token is verified, if it is then just exit, if it isn't then throw 400
 */
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

/*
POST that registers a user into the database
- receives name, email, and password from request body
- encrypts password
- makes database insertion
- creates access token
- returns 200 for successful account creation and login
 */
app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const db = await getDbConnection();

        // Check if email exists
        const [emailRows] = await db.query(
            "SELECT * FROM User WHERE Email = ?",
            [email]
        );
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
        const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
            expiresIn: "7d",
        });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: false, // use true if HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            userId: user.UserID,
            message: "User registered successfully.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

/*
POST method that logs in existing user
- retrieves email and password from request body.
- confirms user exists, if not return 400
- generates access token
- returns 200 for successful login
 */
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = await getDbConnection();

        // Check if the user exists
        const [rows] = await db.query("SELECT * FROM User WHERE Email = ?", [
            email,
        ]);
        if (rows.length === 0) {
            return res
                .status(400)
                .json({ message: "Invalid email or password." });
        }

        const user = rows[0];

        // Compare entered password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: "Invalid email or password." });
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

        res.status(200).json({
            userId: user.UserID,
            message: "Login successful.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

/*
POST that logs out user
- clears token
- returns 200 for successful logout
 */
app.post("/api/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully." });
});

/*
GET that checks token
- returns 200 for successful authentication
 */
app.get("/api/checkAuthenticationStatus", authenticateToken, (req, res) => {
    res.status(200).json({ userId: req.user.userId, message: "Authenticated" });
});

/*
POST method that creates events
- reads event details from request
    - name
    - description
    - startDate
    - endDate
    - startTime
    - endTime
- also retrieves organizer ID
- creates event ID using uuid
- checks if name is greater than 20 characters
- checks if description is less than 150 characters
- checks if dates are correct chronically
- makes database insertion, throws 201 for successful entry
 */
app.post("/api/createEvent", authenticateToken, async (req, res) => {
    try {
        // Get inputs from the request
        const { name, description, startDate, endDate, startTime, endTime } =
            req.body;
        const organizerID = req.user.userId;
        const eventID = uuid();

        // Check that name is less than 20 characters
        if (name.length > 20) {
            return res
                .status(400)
                .json({ error: "Name must be less than 20 characters." });
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
            return res
                .status(400)
                .json({ error: "End time cannot be before start time!" });
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

/*
Function that inserts user availability into database
- takes in userID, eventID, and a var that contains availability
- if availability is empty, return string defining issue
- uses for loop that inserts availability into database
    - checks for start and end times to be correct chronologically
    - creates ID for each availability insertion using uuid
- returns message that shows insertion was successful
 */
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
            const startTime = new Date(
                `${availabilitySlots[i].day}T${availabilitySlots[i].start}`
            );
            const endTime = new Date(
                `${availabilitySlots[i].day}T${availabilitySlots[i].end}`
            );

            // Check that end time is not before start time
            if (endTime < startTime) {
                throw new Error(
                    `Availability ${
                        i + 1
                    }: End time cannot be before start time!`
                );
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

/*
Function that deletes availability
- takes in eventID and userID
- makes query to delete availability of specific user from database
 */
async function deleteAvailability(eventID, userID) {
    try {
        // get connection to database
        const pool = await getDbConnection();
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        //only one query to delete all
        const [result] = await connection.query(
            "DELETE FROM Availability WHERE EventID = ? AND UserID = ?",
            [eventID, userID]
        );

        const message = "All availabilities successfully deleted.";

        connection.release();
        return message;
    } catch (error) {
        return error.message;
    }
}

/*
POST that updates the availability of a user
- retrieves eventID and availability from request
- also retrieves userID
- organizes the availability data into objects
- gets array of specific event and user from database
    - if array is empty then insert the info from the req into the database
    - if array is not empty then delete the availability of that user
- insert new availability into database
- return 201 for proper update
 */
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
        const [existing] = await connection.query(
            "SELECT * FROM EventParticipants WHERE EventID = ? AND UserID = ?",
            [eventID, userID]
        );

        // if no duplicates, insert into EventParticipants (participant is not apart of the event)
        if (existing.length === 0) {
            await connection.query(
                "INSERT INTO EventParticipants (EventID, UserID) VALUES (?, ?)",
                [eventID, userID]
            );
        } else {
            await deleteAvailability(eventID, userID);
        }

        //insert the new availblity given.
        const insertResponse = await insertAvailability(
            userID,
            eventID,
            availabilitySlots
        );

        //return status
        res.status(201).json({ message: insertResponse });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
GET that sends back the availability of an event
- retrieves eventID from request
- makes query to database to get all of the availability from the database
- organizes the availability by user and sends it back along with 200
 */
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

/*
Function that orders availability by user
- takes in array of availabilities
- for each availability, organize the information about the user, id, and dates
 */
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

/*
GET that sends back the information about an event
- retrieves evenID from request
- gets all information about event from database
- returns 404 is event isnt found
- returns 200 is it is found and sends it to frontend
 */
app.get("/api/getEvent/:eventId", async (req, res) => {
    const { eventId } = req.params;

    try {
        const db = await getDbConnection();

        const [rows] = await db.query("SELECT * FROM Event WHERE EventID = ?", [
            eventId,
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Event not found." });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

/*
GET that sends back information about an events participants
- retrieves event ID from request
- makes query to check if event exists in database
    - if it doesnt send 404
- makes another query to get all userIDs associated with eventID to database
- sends that information along with 200
 */
app.get("/api/getEventParticipants/:eventId", async (req, res) => {
    const { eventId } = req.params;

    try {
        const connection = await getDbConnection();

        const [eventRows] = await connection.query(
            "SELECT * FROM Event WHERE EventID = ?",
            [eventId]
        );

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

if (process.env.NODE_ENV == "production") {
    app.use(express.static(buildPath));

    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

process.on("SIGINT", async () => {
    await closePool();
    process.exit(0);
});

if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => console.log(`🚀 Listening on port ${port}`));
}

module.exports = app;

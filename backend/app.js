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

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch {
        res.clearCookie("token");
        res.status(403).json({ message: "Invalid or expired token" });
    }
}

// =========================================================
// REGISTER
// =========================================================
app.post("/api/register", async (req, res) => {
    const db = getDbConnection();
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existing = db
            .prepare("SELECT * FROM User WHERE Email = ?")
            .get(email);
        if (existing) {
            return res.status(400).json({ message: "Email already exists." });
        }

        db.prepare(
            "INSERT INTO User (Name, Email, Password) VALUES (?, ?, ?)"
        ).run(name, email, hashedPassword);

        const user = db
            .prepare("SELECT * FROM User WHERE Email = ?")
            .get(email);

        const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
            expiresIn: "7d",
        });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            userId: user.UserID,
            message: "User registered successfully.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================================
// LOGIN
// =========================================================
app.post("/api/login", async (req, res) => {
    const db = getDbConnection();
    const { email, password } = req.body;

    try {
        const user = db
            .prepare("SELECT * FROM User WHERE Email = ?")
            .get(email);

        if (!user)
            return res
                .status(400)
                .json({ message: "Invalid email or password." });

        const isValid = await bcrypt.compare(password, user.Password);
        if (!isValid)
            return res
                .status(400)
                .json({ message: "Invalid email or password." });

        const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
            expiresIn: "7d",
        });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            userId: user.UserID,
            message: "Login successful.",
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================================
// LOGOUT
// =========================================================
app.post("/api/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully." });
});

// =========================================================
// CHECK AUTH STATUS
// =========================================================
app.get("/api/checkAuthenticationStatus", authenticateToken, (req, res) => {
    res.status(200).json({ userId: req.user.userId, message: "Authenticated" });
});

// =========================================================
// CREATE EVENT
// =========================================================
app.post("/api/createEvent", authenticateToken, (req, res) => {
    const db = getDbConnection();
    const { name, description, startDate, endDate, startTime, endTime } =
        req.body;

    const organizerID = req.user.userId;
    const eventID = uuid();

    if (name.length > 20)
        return res
            .status(400)
            .json({ error: "Name must be less than 20 characters." });
    if (description.length > 150)
        return res
            .status(400)
            .json({ error: "Description must be less than 150 characters." });

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end < start)
        return res
            .status(400)
            .json({ error: "End time cannot be before start time!" });

    try {
        db.prepare(
            "INSERT INTO Event (EventID, OrganizerID, Name, Description, StartDate, EndDate, StartTime, EndTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(
            eventID,
            organizerID,
            name,
            description,
            startDate,
            endDate,
            startTime,
            endTime
        );

        res.status(201).json({ eventID });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =========================================================
// INSERT AVAILABILITY (helper)
// =========================================================
function insertAvailability(userID, eventID, slots) {
    const db = getDbConnection();

    const insert = db.prepare(
        "INSERT INTO Availability (AvailabilityID, UserID, EventID, Date, StartTime, EndTime) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const transaction = db.transaction((slots) => {
        for (const slot of slots) {
            const id = uuid();
            insert.run(id, userID, eventID, slot.day, slot.start, slot.end);
        }
    });

    transaction(slots);
}

// =========================================================
// DELETE AVAILABILITY (helper)
// =========================================================
function deleteAvailability(eventID, userID) {
    const db = getDbConnection();
    db.prepare("DELETE FROM Availability WHERE EventID = ? AND UserID = ?").run(
        eventID,
        userID
    );
}

// =========================================================
// UPDATE AVAILABILITY
// =========================================================
app.post("/api/updateAvailability", authenticateToken, (req, res) => {
    const db = getDbConnection();
    const { eventID, availability } = req.body;
    const userID = req.user.userId;

    const slots = availability.flatMap((slot) =>
        slot.times.map((t) => ({
            day: slot.selectedDate,
            start: t.startTime,
            end: t.endTime,
        }))
    );

    try {
        const exists = db
            .prepare(
                "SELECT * FROM EventParticipants WHERE EventID = ? AND UserID = ?"
            )
            .get(eventID, userID);

        if (!exists) {
            db.prepare(
                "INSERT INTO EventParticipants (EventID, UserID) VALUES (?, ?)"
            ).run(eventID, userID);
        } else {
            deleteAvailability(eventID, userID);
        }

        insertAvailability(userID, eventID, slots);

        res.status(201).json({
            message: "All availabilities successfully inserted.",
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// =========================================================
// GET AVAILABILITY
// =========================================================
app.get("/api/getAvailability/:eventId", (req, res) => {
    const db = getDbConnection();

    const rows = db
        .prepare(
            `SELECT U.Name AS UserName, U.UserID AS UserID,
            A.Date AS AvailabilityDate, A.StartTime, A.EndTime
     FROM User U
     JOIN Availability A ON U.UserID = A.UserID
     WHERE A.EventID = ?
     ORDER BY A.Date, A.StartTime`
        )
        .all(req.params.eventId);

    const grouped = {};

    rows.forEach((row) => {
        const user = row.UserName;
        const id = row.UserID;
        const date = row.AvailabilityDate;

        if (!grouped[user]) grouped[user] = { id, dates: {} };
        if (!grouped[user].dates[date]) grouped[user].dates[date] = [];

        grouped[user].dates[date].push({
            startTime: row.StartTime,
            endTime: row.EndTime,
        });
    });

    const result = Object.entries(grouped).map(([user, data]) => ({
        user,
        userId: data.id,
        availability: Object.entries(data.dates).map(([date, times]) => ({
            date,
            times,
        })),
    }));

    res.status(200).json(result);
});

// =========================================================
// GET EVENT
// =========================================================
app.get("/api/getEvent/:eventId", (req, res) => {
    const db = getDbConnection();
    const event = db
        .prepare("SELECT * FROM Event WHERE EventID = ?")
        .get(req.params.eventId);

    if (!event) return res.status(404).json({ message: "Event not found." });

    res.status(200).json(event);
});

// =========================================================
// GET EVENT PARTICIPANTS
// =========================================================
app.get("/api/getEventParticipants/:eventId", (req, res) => {
    const db = getDbConnection();

    const event = db
        .prepare("SELECT * FROM Event WHERE EventID = ?")
        .get(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const rows = db
        .prepare(
            `SELECT User.UserID, User.Name
     FROM User
     JOIN EventParticipants ON User.UserID = EventParticipants.UserID
     WHERE EventParticipants.EventID = ?`
        )
        .all(req.params.eventId);

    res.status(200).json(rows);
});

// =========================================================
// STATIC BUILD IN PRODUCTION
// =========================================================
if (process.env.NODE_ENV === "production") {
    app.use(express.static(buildPath));

    app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

app.listen(port, () => {
    console.log("Listening on port " + port);
});

process.on("SIGINT", () => {
    process.exit(0);
});

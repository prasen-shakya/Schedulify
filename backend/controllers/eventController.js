const {uuid} = require("uuidv4");
const {getDbConnection} = require("../config/database");


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
exports.createEvent = async (req, res) => {
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
};


/*
GET that sends back the information about an event
- retrieves evenID from request
- gets all information about event from database
- returns 404 is event isnt found
- returns 200 is it is found and sends it to frontend
 */
exports.getEvent = async (req, res) => {
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
};


/*
GET that sends back information about an events participants
- retrieves event ID from request
- makes query to check if event exists in database
    - if it doesnt send 404
- makes another query to get all userIDs associated with eventID to database
- sends that information along with 200
 */
exports.getEventParticipants = async (req, res) => {
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

}


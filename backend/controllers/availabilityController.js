const { getDbConnection } = require("../config/database");
const {
    insertAvailability,
    deleteAvailability,
    orderAvailabilitiesByUser,
} = require("../utils/availabilityUtils");


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
exports.updateAvailability = async (req, res) => {
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

        // if no duplicates, insert into EventParticipants (participant is not a part of the event)
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
};


/*
GET that sends back the availability of an event
- retrieves eventID from request
- makes query to database to get all of the availability from the database
- organizes the availability by user and sends it back along with 200
 */
exports.getAvailability = async (req, res) => {
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

};
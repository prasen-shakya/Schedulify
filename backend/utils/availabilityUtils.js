const { uuid } = require("uuidv4");
const { getDbConnection } = require("../config/database");

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

        //remove from event participants
        const [removed] = await connection.query("DELETE FROM EventParticipants WHERE EventID = ? AND UserID = ?", [eventID, userID]);

        const message = "All availabilities successfully deleted.";

        connection.release();
        return message;
    } catch (error) {
        return error.message;
    }
}


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
            grouped[user] = {id, dates: {}};
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


module.exports = {
    insertAvailability,
    deleteAvailability,
    orderAvailabilitiesByUser,
};


// database.js
const Database = require("better-sqlite3");
const path = require("path");

let db;

function initDb() {
    if (!db) {
        const dbPath = path.join(__dirname, "database.sqlite");

        db = new Database(dbPath);

        // Enable foreign key support
        db.pragma("foreign_keys = ON");

        // Initialize schema
        db.exec(`
            CREATE TABLE IF NOT EXISTS User (
                UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Email TEXT UNIQUE NOT NULL,
                Password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS Event (
                EventID TEXT PRIMARY KEY,
                OrganizerID INTEGER NOT NULL,
                Name TEXT NOT NULL,
                Description TEXT,
                StartDate TEXT NOT NULL,
                EndDate TEXT NOT NULL,
                StartTime TEXT NOT NULL,
                EndTime TEXT NOT NULL,
                CHECK (StartDate <= EndDate),
                CHECK (StartTime <= EndTime),
                FOREIGN KEY (OrganizerID) REFERENCES User(UserID) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS Availability (
                AvailabilityID TEXT PRIMARY KEY,
                UserID INTEGER NOT NULL,
                EventID TEXT NOT NULL,
                Date TEXT NOT NULL,
                StartTime TEXT NOT NULL,
                EndTime TEXT NOT NULL,
                CHECK (StartTime <= EndTime),
                FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
                FOREIGN KEY (EventID) REFERENCES Event(EventID) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS EventParticipants (
                EventID TEXT NOT NULL,
                UserID INTEGER NOT NULL,
                PRIMARY KEY (EventID, UserID),
                FOREIGN KEY (EventID) REFERENCES Event(EventID) ON DELETE CASCADE,
                FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS EventDecision (
                EventID TEXT PRIMARY KEY,
                FinalDate TEXT NOT NULL,
                FinalStartTime TEXT NOT NULL,
                FinalEndTime TEXT NOT NULL,
                CHECK (FinalStartTime <= FinalEndTime),
                FOREIGN KEY (EventID) REFERENCES Event(EventID) ON DELETE CASCADE
            );
        `);

        console.log(
            "SQLite database initialized ✔ (tables created if missing)"
        );
    }
    return db;
}

function getDbConnection() {
    return initDb();
}

module.exports = {
    getDbConnection,
};

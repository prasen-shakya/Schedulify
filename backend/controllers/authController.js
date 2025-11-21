const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDbConnection } = require("../config/database");

const jwtSecret = process.env.JWT_SECRET || "jwttoken";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set true in production (HTTPS)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};


/*
POST that registers a user into the database
- receives name, email, and password from request body
- encrypts password
- makes database insertion
- creates access token
- returns 200 for successful account creation and login
 */
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const db = await getDbConnection();

        // Check if email exists
        const [emailRows] = await db.query("SELECT * FROM User WHERE Email = ?", [
            email,
        ]);
        if (emailRows.length > 0) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

        res.cookie("token", accessToken, cookieOptions);

        res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};


/*
POST method that logs in existing user
- retrieves email and password from request body.
- confirms user exists, if not return 400
- generates access token
- returns 200 for successful login
 */
exports.login = async (req, res) => {
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
        const accessToken = jwt.sign({ userId: user.UserID }, jwtSecret, {
            expiresIn: "7d",
        });

        res.cookie("token", accessToken, cookieOptions);

        res.status(200).json({ message: "Login successful." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};


/*
POST that logs out user
- clears token
- returns 200 for successful logout
 */
exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully." });
};


/*
GET that checks token
- returns 200 for successful authentication
 */
exports.checkAuthenticationStatus = (req, res) => {
    res.status(200).json({ userId: req.user.userId, message: "Authenticated" });
};


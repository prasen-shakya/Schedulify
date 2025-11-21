
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "jwttoken";



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

module.exports = authenticateToken;

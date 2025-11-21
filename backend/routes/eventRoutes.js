const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
    createEvent,
    getEvent,
    getEventParticipants,
} = require("../controllers/eventController");

const router = express.Router();

router.post("/createEvent", authenticateToken, createEvent);
router.get("/getEvent/:eventId", getEvent);
router.get("/getEventParticipants/:eventId", getEventParticipants);

module.exports = router;
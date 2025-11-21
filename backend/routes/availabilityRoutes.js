const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
    updateAvailability,
    getAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

router.post("/updateAvailability", authenticateToken, updateAvailability);
router.get("/getAvailability/:eventId", getAvailability);

module.exports = router;
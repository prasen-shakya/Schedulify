const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
    register,
    login,
    logout,
    checkAuthenticationStatus,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get(
    "/checkAuthenticationStatus",
    authenticateToken,
    checkAuthenticationStatus
);

module.exports = router;
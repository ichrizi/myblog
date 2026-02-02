const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, refresh, logout } = require("../controllers/authController.js");
const { protect } = require("../middeware/authMiddleware.js");

const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many auth attempts, please try again later.",
});

// ===== REGISTER =====
router.post("/register", authLimiter, register);

// ===== LOGIN =====
router.post("/login", authLimiter, login);

// ===== REFRESH =====
router.post("/refresh", authLimiter, refresh);

// ===== LOGOUT =====
router.post("/logout", authLimiter, protect, logout);

module.exports = router;
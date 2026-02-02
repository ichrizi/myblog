const express = require("express");
const { getAllUsers } = require("../controllers/userController.js");
const { protect, admin } = require("../middeware/authMiddleware.js");

const router = express.Router();

// ===== GET ALL USERS (admin only) =====
router.get("/", protect, admin, getAllUsers);

module.exports = router;
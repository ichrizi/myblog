const User = require("../models/userModel.js");
const logger = require("../utils/logger.js");

// GET ALL USERS (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    logger.info("Retrieved all users", { count: users.length, adminId: req.user._id });
    return res.status(200).json(users);
  } catch (err) {
    logger.error("Error fetching all users", err);
    return res.status(500).json({ success: false, error: "Failed to fetch users", details: err.message });
  }
};

module.exports = { getAllUsers }; 
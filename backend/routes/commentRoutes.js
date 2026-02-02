const express = require("express");
const { createComment, getCommentsByPostId, deleteComment } = require("../controllers/commentController.js");
const { protect } = require("../middeware/authMiddleware.js");

const router = express.Router();

// ===== GET COMMENTS BY POST ID =====
router.get("/:postId", getCommentsByPostId);

// ===== CREATE NEW COMMENT (protected) =====
router.post("/", protect, createComment);

// ===== DELETE COMMENT (protected, owner/admin only) =====
router.delete("/:id", protect, deleteComment);

module.exports = router;
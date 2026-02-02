const express = require("express");
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require("../controllers/blogPostController.js");
const { protect } = require("../middeware/authMiddleware.js");

const router = express.Router();

// ===== CREATE BLOG POST (protected) =====
router.post("/", protect, createPost);

// ===== GET ALL POSTS =====
router.get("/", getAllPosts);

// ===== GET SINGLE POST =====
router.get("/:id", getPostById);

// ===== UPDATE POST (protected, owner/admin only) =====
router.put("/:id", protect, updatePost);

// ===== DELETE POST (protected, owner/admin only) =====
router.delete("/:id", protect, deletePost);

module.exports = router;
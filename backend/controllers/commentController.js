const Comment = require('../models/commentModel.js');
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const logger = require("../utils/logger.js");

// @route   POST /api/comments 
// @desc    Add a comment to a post 
// @access  Private (Requires 'protect' middleware) 
const createComment = async (req, res) => {
    try {
        // This function relies on req.user being populated by the 'protect' middleware. 
         
        // 1. Get data from request body and req.user 
        const { postId, content } = req.body;  
         
        // Ensure req.user exists (The 'protect' middleware usually guarantees this) 
        if (!req.user) { 
            logger.warn("Create comment failed: no user data");
            return res.status(401).json({ success: false, message: "Unauthorized: User data missing (Protect middleware failed)" });
        } 
     
        // Get necessary user data from the object attached by the 'protect' middleware 
        const userId = req.user._id; 
        // Use the username field, or fallback to email for display name 
        const authorName = req.user.username || req.user.email;  
     
        // 2. Validation 
        if (!postId || !content) { 
            logger.warn("Create comment failed: missing fields", { postId });
            return res.status(400).json({ success: false, message: "Post ID and comment content are required." });
        }

        // Validate postId format
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            logger.warn("Create comment failed: invalid post ID", { postId });
            return res.status(400).json({ success: false, message: "Invalid post ID format" });
        }

        // Length validation
        if (content.trim().length < 1 || content.trim().length > 2000) {
            logger.warn("Create comment failed: content length invalid");
            return res.status(400).json({ success: false, message: "Comment must be 1-2000 characters" });
        }
     
        // 3. Create new comment document 
        const comment = new Comment({ 
            post: postId, 
            user: userId,           
            author: authorName,     
            content: content.trim(), 
        }); 
     
        // 4. Save and Respond 
        const createdComment = await comment.save(); 
     
        logger.info("Comment created successfully", { commentId: createdComment._id, postId, userId });
        res.status(201).json({  
            success: true,
            message: "Comment posted successfully", 
            comment: createdComment 
        });
    } catch (err) {
        logger.error("Error creating comment", err, { postId: req.body.postId });
        return res.status(500).json({ success: false, error: "Failed to create comment", details: err.message });
    }
}; 
 
// @route   GET /api/comments/:postId 
// @desc    Get all comments for a specific post 
// @access  Public (Anyone can view comments) 
const getCommentsByPostId = async (req, res) => {
    try {
        const { postId } = req.params; 
     
        if (!postId) { 
            logger.warn("Get comments failed: no post ID");
            return res.status(400).json({ success: false, message: "Post ID is required to fetch comments." });
        }

        // Validate postId format
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            logger.warn("Get comments failed: invalid post ID", { postId });
            return res.status(400).json({ success: false, message: "Invalid post ID format" });
        }
     
        // Find all comments related to the postId, sorted by newest first 
        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 });
        
        logger.info("Retrieved comments for post", { postId, count: comments.length });
        // Respond with the array of comments 
        res.json(comments);
    } catch (err) {
        logger.error("Error fetching comments", err, { postId: req.params.postId });
        return res.status(500).json({ success: false, error: "Failed to fetch comments", details: err.message });
    }
};

// DELETE COMMENT (Protected, owner/admin only)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn("Delete comment failed: invalid comment ID", { id });
            return res.status(400).json({ success: false, message: "Invalid comment ID" });
        }

        const comment = await Comment.findById(id);
        if (!comment) {
            logger.warn("Delete comment failed: comment not found", { commentId: id });
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        // Ownership check: only comment owner or admin can delete
        if (req.user.role !== "admin" && comment.user.toString() !== req.user._id.toString()) {
            logger.warn("Delete comment failed: insufficient permissions", { userId: req.user._id, commentId: id });
            return res.status(403).json({ success: false, message: "Forbidden: You can only delete your own comments" });
        }

        await Comment.findByIdAndDelete(id);

        logger.info("Comment deleted successfully", { commentId: id, userId: req.user._id });
        return res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (err) {
        logger.error("Error deleting comment", err, { commentId: req.params.id });
        return res.status(500).json({ success: false, error: "Failed to delete comment", details: err.message });
    }
};

module.exports = { createComment, getCommentsByPostId, deleteComment };
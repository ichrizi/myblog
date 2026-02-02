const BlogPost = require("../models/blogPostModel.js");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const logger = require("../utils/logger.js");
 
// =================================== 
// GET ALL POSTS (Used by HomePage.js) 
// =================================== 
const getAllPosts = async (req, res) => { 
    try { 
        const posts = await BlogPost.find({}).sort({ createdAt: -1 });
        logger.info("Retrieved all posts", { count: posts.length });
        return res.status(200).json(posts); 
    } catch (err) { 
        logger.error("Error fetching all posts", err);
        return res.status(500).json({ success: false, error: "Failed to fetch posts", details: err.message }); 
    } 
};
 
// =================================== 
// GET POST BY ID (Used by SinglePostView.js) 
// =================================== 
const getPostById = async (req, res) => { 
    try { 
        const { id } = req.params; 
        if (!mongoose.Types.ObjectId.isValid(id)) { 
            logger.warn("Invalid post ID format", { id });
            return res.status(400).json({ success: false, message: "Invalid post ID" }); 
        } 
 
        const post = await BlogPost.findById(id); 
        if (!post) {
            logger.warn("Post not found", { id });
            return res.status(404).json({ success: false, message: "Post not found" }); 
        }
 
        logger.info("Retrieved post by ID", { postId: id, title: post.title });
        return res.status(200).json(post); 
    } catch (err) { 
        logger.error("Error fetching single post", err, { postId: req.params.id });
        return res.status(500).json({ success: false, error: "Failed to fetch post", details: err.message }); 
    } 
};
 
// =================================== 
// CREATE POST (Used by CreatePostPage.js) 
// =================================== 
const createPost = async (req, res) => { 
    try { 
        let { title, content, author } = req.body;  
 
        if (!title || !content || !author) { 
            logger.warn("Create post failed: missing fields");
            return res.status(400).json({ success: false, message: "All fields (title, content, author) are required" }); 
        }

        // Length validation
        if (title.trim().length < 3 || title.trim().length > 200) {
            logger.warn("Create post failed: title length invalid");
            return res.status(400).json({ success: false, message: "Title must be 3-200 characters" });
        }

        if (content.trim().length < 10 || content.trim().length > 50000) {
            logger.warn("Create post failed: content length invalid");
            return res.status(400).json({ success: false, message: "Content must be 10-50,000 characters" });
        }

        if (author.trim().length < 2 || author.trim().length > 100) {
            logger.warn("Create post failed: author length invalid");
            return res.status(400).json({ success: false, message: "Author must be 2-100 characters" });
        }
 
        title = title.trim(); 
        content = content.trim(); 
        author = author.trim(); 
 
        const newPost = new BlogPost({ title, content, author }); 
        await newPost.save(); 
 
        logger.info("Post created successfully", { postId: newPost._id, title, author });
        return res.status(201).json({ success: true, message: "Post created successfully", post: newPost }); 
    } catch (err) { 
        logger.error("Error creating post", err);
        return res.status(500).json({ success: false, error: "Failed to create post", details: err.message }); 
    } 
};
 
// Placeholder for other functions (Update/Delete) 
// export const updatePost = async (req, res) => { /* ... */ }; 
// export const deletePost = async (req, res) => { /* ... */ }; 

// =================================== 
// UPDATE POST (Protected, owner/admin only) 
// =================================== 
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn("Update post failed: invalid post ID", { id });
            return res.status(400).json({ success: false, message: "Invalid post ID" });
        }

        if (!title || !content) {
            logger.warn("Update post failed: missing fields", { postId: id });
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        if (title.trim().length < 3 || title.trim().length > 200) {
            logger.warn("Update post failed: title length invalid", { postId: id });
            return res.status(400).json({ success: false, message: "Title must be 3-200 characters" });
        }

        if (content.trim().length < 10 || content.trim().length > 50000) {
            logger.warn("Update post failed: content length invalid", { postId: id });
            return res.status(400).json({ success: false, message: "Content must be 10-50,000 characters" });
        }

        const post = await BlogPost.findById(id);
        if (!post) {
            logger.warn("Update post failed: post not found", { postId: id });
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Ownership check: only owner or admin can update
        if (req.user.role !== "admin" && post.author !== req.user.username) {
            logger.warn("Update post failed: insufficient permissions", { userId: req.user._id, postId: id });
            return res.status(403).json({ success: false, message: "Forbidden: You can only edit your own posts" });
        }

        post.title = title.trim();
        post.content = content.trim();
        await post.save();

        logger.info("Post updated successfully", { postId: id, userId: req.user._id });
        return res.status(200).json({ success: true, message: "Post updated successfully", post });
    } catch (err) {
        logger.error("Error updating post", err, { postId: req.params.id, userId: req.user._id });
        return res.status(500).json({ success: false, error: "Failed to update post", details: err.message });
    }
};

// =================================== 
// DELETE POST (Protected, owner/admin only) 
// =================================== 
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.warn("Delete post failed: invalid post ID", { id });
            return res.status(400).json({ success: false, message: "Invalid post ID" });
        }

        const post = await BlogPost.findById(id);
        if (!post) {
            logger.warn("Delete post failed: post not found", { postId: id });
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Ownership check: only owner or admin can delete
        if (req.user.role !== "admin" && post.author !== req.user.username) {
            logger.warn("Delete post failed: insufficient permissions", { userId: req.user._id, postId: id });
            return res.status(403).json({ success: false, message: "Forbidden: You can only delete your own posts" });
        }

        await BlogPost.findByIdAndDelete(id);

        logger.info("Post deleted successfully", { postId: id, userId: req.user._id });
        return res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
        logger.error("Error deleting post", err, { postId: req.params.id, userId: req.user._id });
        return res.status(500).json({ success: false, error: "Failed to delete post", details: err.message });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
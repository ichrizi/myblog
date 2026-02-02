const mongoose = require("mongoose"); 
const blogPostSchema = new mongoose.Schema({ 
title: { type: String, required: true, trim: true }, 
content: { type: String, required: true }, 
author: { type: String, required: true }, 
}, { timestamps: true }); 
const BlogPost = mongoose.model("BlogPost", blogPostSchema); 
module.exports = BlogPost;
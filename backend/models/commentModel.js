const mongoose = require("mongoose"); 
 
const commentSchema = new mongoose.Schema( 
  { 
    post: {  
      type: mongoose.Schema.Types.ObjectId,  
      required: true,  
      ref: 'BlogPost'  
    }, 
    user: {  
      type: mongoose.Schema.Types.ObjectId,  
      required: true,  
      ref: 'User'
    }, 
    content: {  
      type: String,  
      required: true  
    },
    author: {
      type: String,
      required: true
    }
  }, 
  { timestamps: true } 
); 
 
module.exports = mongoose.model("Comment", commentSchema);
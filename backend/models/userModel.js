const mongoose = require("mongoose"); 
const userSchema = new mongoose.Schema(
{
username: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, trim: true },
password: { type: String, required: true },
role: { type: String, default: "user" },
refreshTokenHash: { type: String, default: null },
refreshTokenExp: { type: Date, default: null },
},
{ timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
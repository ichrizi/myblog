const express = require("express"); 
const cors = require("cors"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const helmet = require("helmet");

const connectDB = require("./config/db.js");
const logger = require("./utils/logger.js");
const { errorHandler } = require("./middeware/errorHandler.js");
const authRoutes = require("./routes/authRoutes.js"); 
const blogRoutes = require("./routes/blogRoutes.js"); 
const commentRoutes = require("./routes/commentRoutes.js"); 
const userRoutes = require("./routes/userRoutes.js"); 
 
// Load .env 
dotenv.config({ path: path.join(__dirname, ".env") }); 
 
// Initialize Express 
const app = express(); 
app.use(cors({ origin: "http://localhost:3000", credentials: true })); 
app.use(express.json());

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks 
 
// Health check route 
app.get("/", (req, res) => {
  console.log('DEBUG: Health check route called');
  res.send("API running");
}); 
 
// Routes 
app.use("/api/auth", authRoutes); 
app.use("/api/blog", blogRoutes); 
app.use("/api/comments", commentRoutes); // <-- Correctly mounted at /api/comments 
app.use("/api/users", userRoutes); 
 
// 404 handler 
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" })); 

// Error handling middleware (must be last)
app.use(errorHandler); 
 
// Start server after DB connection 
const PORT = process.env.PORT || 5000; 
 
const startServer = async () => { 
    try {
        console.log('DEBUG: Starting server...');
        await connectDB(); 
        console.log('DEBUG: DB connected, setting up listener');
        const server = app.listen(PORT, '127.0.0.1', () => {
            console.log(`Server running on http://127.0.0.1:${PORT}`);
        }); 
        console.log('DEBUG: Server listen() called');

        // Prevent server from exiting
        server.on('error', (err) => {
          console.error('Server error:', err);
        });
    } catch (err) { 
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); 
    } 
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', new Error(String(reason)));
});

startServer();
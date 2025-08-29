const express = require("express");
require("dotenv").config(); // Load .env file
const mongoose = require("mongoose"); // Import Mongoose
const cors = require("cors"); // Import CORS

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Connect to MongoDB
mongoose.connect(DB_URL)
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Routes
const postRoutes = require("./routes/postRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");


// API Routes
app.use("/api/posts", postRoutes);
app.use("/api/lawyers", lawyerRoutes);


// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Legal Aid Backend API",
    version: "1.0.0",
    endpoints: {
      posts: "/api/posts",
      users: "/api/users",
      health: "/health"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 Server accessible at http://10.4.2.1:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api/posts`);
});
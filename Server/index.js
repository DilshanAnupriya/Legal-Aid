const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.8.189:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((error, req, res, next) => {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'error',
        error: 'File size too large. Maximum 5MB allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'error',
        error: 'Too many files. Maximum 11 files allowed.'
      });
    }
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      message: 'error',
      error: 'Only image files are allowed!'
    });
  }

  next(error);
});

// Connect to MongoDB
mongoose.connect(DB_URL)
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));


//NGO
const ngoRoutes = require('./routes/ngoRoutes');
app.use('/api/ngo', ngoRoutes);
// Import Routes
const postRoutes = require("./Routes/postRoutes");
const {MulterError} = require("multer");


// API Routes
app.use("/api/posts", postRoutes);


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
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const {MulterError} = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

// Middleware
app.use(cors({

  origin: 'http://localhost:3000',
  credentials: true

  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000', 
    'http://10.0.2.2:3000', 'http://10.4.2.1:3000',
    'http://localhost:8081', 'http://127.0.0.1:8081', // Expo web dev server
    'http://localhost:19006', 'http://127.0.0.1:19006', // Alternative Expo web port
    'http://localhost:8080', 'http://127.0.0.1:8080', // Common dev server port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support

}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, {
    headers: {
      origin: req.headers.origin,
      'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
      'content-type': req.headers['content-type']
    },
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});


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
const ngoRoutes = require('./Routes/ngoRoutes');
app.use('/api/ngo', ngoRoutes);
// Import Routes
const postRoutes = require("./Routes/postRoutes");
const userRoutes = require("./Routes/userRoutes");
const lawyerRoutes = require("./Routes/lawyerRoutes");


// API Routes
app.use("/api/posts", postRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/lawyers", lawyerRoutes);


// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Legal Aid Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
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
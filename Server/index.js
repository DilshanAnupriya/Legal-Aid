const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

// Middleware - Updated CORS for better compatibility
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://10.0.2.2:3000', 
    'http://10.4.2.1:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:8081', 
    'http://10.0.2.2:8081', 
    'http://10.4.2.1:8081',
    'http://10.164.198.42:8081', // Add current network IP for client
    'http://10.164.198.42:3000'  // Add current network IP for server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for document uploads
app.use('/uploads', express.static('uploads'));

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

// Connect to MongoDB with improved error handling
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Server will continue without MongoDB. Some features may not work.");
    // Don't exit the process, allow server to start for testing
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Connect to MongoDB
connectToMongoDB();


//NGO
const ngoRoutes = require('./routes/ngoRoutes');
app.use('/api/ngo', ngoRoutes);

// Import Document Routes
const documentRoutes = require('./Routes/documentRoutes');
app.use('/api/documents', documentRoutes);

// Import Post Routes
const postRoutes = require("./Routes/postRoutes");
const {MulterError} = require("multer");
const lawyerRoutes = require("./Routes/lawyerRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const appointmentRoutes = require('./Routes/appointmentRoutes');


// API Routes
app.use("/api/ngo", ngoRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/admins",adminRoutes);
app.use('/api/appointments', appointmentRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Legal Aid Backend API",
    version: "1.0.0",
    endpoints: {
      posts: "/api/posts",
      documents: "/api/documents",
      ngo: "/api/ngo",
      health: "/health",
      lawyers: "/api/lawyers",
      admins:"/api/admins"
    },
    server: {
      status: "running",
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      readyState: mongoose.connection.readyState
    },
    server: {
      port: PORT,
      nodeVersion: process.version,
      platform: process.platform
    }
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
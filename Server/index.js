const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const {MulterError} = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;

app.use(cors({
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000', 
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://10.0.2.2:3000', 'http://10.4.2.1:3000',
    'http://localhost:8081', 'http://127.0.0.1:8081', // Expo web dev server
    'http://localhost:19006', 'http://127.0.0.1:19006', // Alternative Expo web port
    'http://localhost:8080', 'http://127.0.0.1:8080',
    'http://10.0.2.2:8081', 'http://10.4.2.1:8081',
    'http://10.164.198.42:8081','http://10.164.198.42:3000'// Common dev server port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}));


// Body parsing middleware - increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Connect to MongoDB
mongoose.connect(DB_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));


//NGO
const ngoRoutes = require('./Routes/ngoRoutes');

// Import Routes
const postRoutes = require("./Routes/postRoutes");
const pollRoutes = require("./Routes/pollRoutes");
const userRoutes = require("./Routes/userRoutes");
const lawyerRoutes = require('./Routes/lawyerRoutes');
const appointmentRoutes = require('./Routes/appointmentRoutes');
const documentRoutes = require('./Routes/documentRoutes');
const adminRoutes = require('./Routes/adminRoutes');



// API Routes
app.use("/api/ngo", ngoRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use("/api/admin", adminRoutes);


// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Legal Aid Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      polls: "/api/polls",
      health: "/health",
      apointments:"/api/appointments"
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
  console.error('Error occurred:', err);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Malformed JSON'
    });
  }
  
  // Handle other errors
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
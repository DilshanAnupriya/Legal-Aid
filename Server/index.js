const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const { MulterError } = require("multer");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL;
const apiKey = process.env.GEMINI_API_KEY;

// ==================== AUTO-CREATE DIRECTORIES ====================
const createRequiredDirectories = () => {
  const directories = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'documents'),
    path.join(__dirname, 'uploads', 'images'),
    path.join(__dirname, 'uploads', 'profiles'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  console.log('✅ All required directories are ready!');
};

// Create directories on startup
createRequiredDirectories();
// ==================== END DIRECTORY CREATION ====================

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 'http://127.0.0.1:3000',
    'http://10.0.2.2:3000', 'http://10.4.2.1:3000',
    'http://localhost:8081', 'http://127.0.0.1:8081',
    'http://localhost:19006', 'http://127.0.0.1:19006',
    'http://localhost:8080', 'http://127.0.0.1:8080',
    'http://10.0.2.2:8081', 'http://10.4.2.1:8081',
    'http://10.164.198.42:8081', 'http://10.164.198.42:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware - increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
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

// Multer error handling
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

// Import Routes
const ngoRoutes = require('./Routes/ngoRoutes');
const postRoutes = require("./Routes/postRoutes");
const pollRoutes = require("./Routes/pollRoutes");
const userRoutes = require("./Routes/userRoutes");
const lawyerRoutes = require('./Routes/lawyerRoutes');
const appointmentRoutes = require('./Routes/appointmentRoutes');
const documentRoutes = require('./Routes/documentRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const notificationRoutes = require('./Routes/notificationRoutes');
const ngoMatchingRoutes = require('./Routes/ngoMatchingRoutes');
const documentGeneratorRoutes = require('./Routes/documentGeneratorRoutes'); // ✅ NEW
const LawyerProfile = require('./Routes/lawyerProfileRoutes');

// API Routes
app.use("/api/ngo", ngoRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/documents', documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ngo", ngoMatchingRoutes);
app.use("/api/documents/generate", documentGeneratorRoutes); // ✅ NEW
app.use("/api/lawyers/AddprofileDetails",LawyerProfile)

// ==================== GEMINI CHATBOT ROUTES ====================

// Helper function to list available models
app.get('/api/chat/models', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured'
      });
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    // Filter models that support generateContent
    const generateContentModels = data.models?.filter(model =>
        model.supportedGenerationMethods?.includes('generateContent')
    );

    res.json({
      success: true,
      models: generateContentModels,
      count: generateContentModels?.length || 0
    });
  } catch (error) {
    console.error('❌ Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat endpoint - Send message to Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    // Validate request
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }

    // Check if API key is configured
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: API key not found'
      });
    }

    // Build the prompt with conversation context
    let prompt = `You are a helpful legal aid assistant. Provide general legal information but always remind users to consult with a licensed attorney for specific legal advice. Keep responses concise, clear, and easy to understand.\n\n`;

    // Add conversation history if provided (last 5 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
      });
    }

    prompt += `User: ${message}\nAssistant:`;

    // Updated model names - using current Gemini 2.0 and 2.5 models
    const modelNames = [
      'models/gemini-flash-latest',      // Auto-updates to latest Flash (recommended)
      'models/gemini-2.5-flash',         // Stable Gemini 2.5 Flash
      'models/gemini-2.0-flash',         // Gemini 2.0 Flash
      'models/gemini-pro-latest',        // Auto-updates to latest Pro
      'models/gemini-2.5-pro'            // Stable Gemini 2.5 Pro
    ];

    let lastError = null;

    for (const modelName of modelNames) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

        console.log(`🤖 Trying model: ${modelName}...`);

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
              topP: 0.8,
              topK: 40
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData;
          console.log(`❌ Model ${modelName} failed:`, errorData.error?.message || 'Unknown error');
          continue; // Try next model
        }

        const data = await response.json();

        // Extract the response text
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          const botResponse = data.candidates[0].content.parts[0].text;

          console.log(`✅ Successfully received response from Gemini using model: ${modelName}`);

          return res.json({
            success: true,
            message: botResponse,
            model: modelName,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`❌ Invalid response format from ${modelName}`);
          lastError = { error: { message: 'Invalid response format' } };
          continue; // Try next model
        }
      } catch (error) {
        console.log(`❌ Error with model ${modelName}:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models failed
    throw new Error(`All models failed. Last error: ${lastError?.error?.message || lastError?.message || 'Unknown error'}`);

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      hint: 'Try visiting /api/chat/models to see available models'
    });
  }
});

// ==================== END CHATBOT ROUTES ====================

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Legal Aid Backend API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      polls: "/api/polls",
      chat: "/api/chat",
      chatModels: "/api/chat/models",
      lawyers: "/api/lawyers",
      appointments: "/api/appointments",
      documents: "/api/documents",
      documentGenerator: "/api/documents/generate", // ✅ NEW
      documentGeneratorTemplates: "/api/documents/generate/templates", // ✅ NEW
      documentGeneratorPreview: "/api/documents/generate/preview", // ✅ NEW
      admin: "/api/admin",
      notifications: "/api/notifications",
      ngo: "/api/ngo",
      health: "/health"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    geminiApiKey: apiKey ? 'configured' : 'not configured'
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
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌐 Server accessible at http://10.4.2.1:${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\n📡 ENDPOINTS:`);
  console.log(`   💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`   📋 Chat Models: http://localhost:${PORT}/api/chat/models`);
  console.log(`   📄 Document Generator: http://localhost:${PORT}/api/documents/generate`);
  console.log(`   📝 Document Templates: http://localhost:${PORT}/api/documents/generate/templates`);
  console.log(`   👁️  Document Preview: http://localhost:${PORT}/api/documents/generate/preview`);
  console.log(`   🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`   📚 API Docs: http://localhost:${PORT}`);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔑 Gemini API Key: ${apiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...'}`);
  console.log(`📁 Upload Directories: ✅ Ready`);
  console.log(`${'='.repeat(60)}\n`);
});
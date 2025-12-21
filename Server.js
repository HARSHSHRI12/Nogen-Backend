const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require('express-rate-limit');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const runCodeRoutes = require('./routes/runCodeRoute');
const userSettingsRoutes = require('./routes/userSettingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cookieParser = require("cookie-parser");

const app = express();

//  Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // stricter for auth endpoints
  message: 'Too many auth requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
const allowedOrigins = [
  "http://localhost:3000", // Always allow localhost:3000 for local development
  process.env.CLIENT_URL, // Netlify frontend URL (e.g., https://your-netlify-app.netlify.app)
  process.env.BACKEND_URL // Render backend URL (e.g., https://your-render-app.onrender.com)
].filter(Boolean); 

// CORS configuration: use a single function to check origin
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) { // Allow server-to-server requests, Postman, etc.
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Ensure preflight requests are handled for all routes
app.options('*', cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use(globalLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/user', require('./routes/UserRoutes'));
app.use('/api/generate', require('./routes/GenerateRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/submit', require('./routes/submissionRoutes'));
app.use('/api/contact', contactRoutes);
app.use('/api', runCodeRoutes);
app.use('/api/settings', userSettingsRoutes);
app.use('/api/notifications', notificationRoutes);

//  MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // tuned for moderate concurrency
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

connectDB();

//health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime()
  });
});

//  Catch-all 404 handler
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

//  Error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

//  Start server
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
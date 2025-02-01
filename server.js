const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const stockRoutes = require('./routes/stockRoutes');
const profileRoutes = require('./routes/profileRoutes');
const watchlistRoutes = require('./routes/watchlist.routes');
const authRoutes = require('./routes/auth.routes');
const authMiddleware = require('./middleware/auth.middleware');
const morgan = require('morgan');
const authController = require('./controllers/auth.controller');

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB first
connectDB().then(() => {
  // CORS configuration
  app.use(cors({
    origin: 'http://localhost:5174',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(express.json());
  app.use(morgan('dev')); // Add logging

  // Debug middleware for all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
      body: req.body,
      headers: req.headers
    });
    next();
  });

  // Add response headers middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Add this before your route definitions
  app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'Authorization');
    next();
  });

  // Add debug logging middleware for auth routes
  app.use('/api/auth', (req, res, next) => {
    console.log('Auth Route Request:', {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query
    });
    next();
  });

  // Routes that don't need authentication
  app.use('/api/auth', authRoutes);

  // Protected routes
  app.use('/api/stocks', authMiddleware, stockRoutes);
  app.use('/api/profile', authMiddleware, profileRoutes);
  app.use('/api/watchlist', authMiddleware, watchlistRoutes);

  // Auth routes
  app.post('/api/auth/google', authController.googleAuth); // Add /api prefix

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Handle 404
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

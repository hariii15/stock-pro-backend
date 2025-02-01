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
    origin: "https://stock-pro-frontend-one.vercel.app",  // Single origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }));

  // Pre-flight requests
  app.options('*', cors());

  app.use(express.json());
  app.use(morgan('dev'));

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, {
      origin: req.headers.origin,
      body: req.body,
      headers: req.headers
    });
    next();
  });

  // Debug middleware for auth routes - place this before route mounting
  app.use('/api/auth', (req, res, next) => {
    console.log('Auth Route Request:', {
      method: req.method,
      path: req.path,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    });
    next();
  });

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stocks', authMiddleware, stockRoutes);
  app.use('/api/profile', authMiddleware, profileRoutes);
  app.use('/api/watchlist', authMiddleware, watchlistRoutes);

  // Test route
  app.get('/test', (req, res) => {
    res.json({ 
      message: 'Backend is working',
      cors: true,
      origin: req.headers.origin 
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
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
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Allowed origins: ${"https://stock-pro-frontend-one.vercel.app"}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

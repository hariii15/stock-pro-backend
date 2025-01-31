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
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // CORS configuration
    app.use(cors({
      origin: [
        'http://localhost:5173',  // Local development
        'stock-pro-frontend-li8p.vercel.app'  // Production frontend
      ],
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
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    app.use('/api/stocks', stockRoutes);
    app.use('/api/profile', authMiddleware, profileRoutes);
    app.use('/api/watchlist', authMiddleware, watchlistRoutes);

    // Add debug logging for all routes
    app.use((req, res, next) => {
      console.log('Request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
      });
      next();
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server Error:', err);
      res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
      });
    });

    // Handle 404
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Add this before your routes
    mongoose.connection.on('error', err => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected! Attempting to reconnect...');
      setTimeout(() => {
        connectDB().catch(err => {
          console.error('Failed to reconnect to MongoDB:', err);
        });
      }, 5000); // Wait 5 seconds before trying to reconnect
    });

    // Add error handling for uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (error) => {
      console.error('Unhandled Rejection:', error);
    });

    // Add a health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Add this with your other routes
    app.get('/api/db-status', (req, res) => {
      const status = mongoose.connection.readyState;
      const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      res.json({
        status: states[status],
        connected: status === 1,
        timestamp: new Date().toISOString()
      });
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Wait 5 seconds and try to reconnect
    setTimeout(() => {
      console.log('Attempting to restart server...');
      startServer();
    }, 5000);
  }
};

// Start the server
startServer();

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});

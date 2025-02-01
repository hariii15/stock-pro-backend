const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

// Test route to verify the endpoint is working
router.get('/google', (req, res) => {
  res.json({ message: "Google Auth endpoint is working" });
});

// Google OAuth authentication endpoint
router.post('/google', authController.googleAuth);

// Token verification endpoint
router.get('/verify', authMiddleware, authController.verifyToken);

// Other auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

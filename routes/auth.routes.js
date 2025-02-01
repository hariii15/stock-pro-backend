const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

// Google OAuth endpoint - this is the only endpoint needed for client-side flow
router.post('/google', authController.googleAuth);

// Token verification
router.get('/verify', authMiddleware, authController.verifyToken);

// Other auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

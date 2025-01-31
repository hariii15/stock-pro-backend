const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * Authentication Routes
 * Handles all authentication-related endpoints
 */

// Initial redirect route
router.get('/', authController.initialRedirect);

// User registration endpoint
router.post('/register', authController.register);

// Traditional email/password login endpoint
router.post('/login', authController.login);

// Google OAuth authentication endpoint
router.post('/google', authController.googleAuth);

// Token verification endpoint
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;

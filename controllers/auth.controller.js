const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Auth Controller
 * Handles authentication logic and user management
 */
const authController = {
    // Add this new method
    initialRedirect: (req, res) => {
        res.redirect('/auth/google');
    },

    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const user = new User({ email, password, name });
            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { _id: user._id, email: user.email, name: user.name },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * Google Authentication
     * Verifies Google token and creates/updates user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    googleAuth: async (req, res) => {
        try {
            const { token, userData } = req.body;
            
            if (!userData || !userData.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user data'
                });
            }

            let user = await User.findOne({ email: userData.email });
            
            if (!user) {
                // Create new user if doesn't exist
                user = await User.create({
                    email: userData.email,
                    name: userData.name,
                    googleId: userData.googleId,
                    picture: userData.picture
                });
            }

            // Generate JWT token
            const jwtToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token: jwtToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            });

        } catch (error) {
            console.error('Google auth error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication failed'
            });
        }
    },

    /**
     * Token Verification
     * Verifies JWT token and returns user data
     */
    verifyToken: async (req, res) => {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Token verification failed'
            });
        }
    }
};

module.exports = authController;

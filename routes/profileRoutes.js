const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const router = express.Router();

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({ message: 'Profile routes are accessible' });
});

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const accessToken = authHeader.split(' ')[1];
    
    try {
      // Use the access token to get user info from Google
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      req.user = response.data;
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Profile routes are working' });
});

// Get profile data
router.get('/', authenticate, async (req, res) => {
  try {
    const { name, email, picture } = req.user;
    res.json({
      name: name,
      email: email,
      avatar: picture
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update profile (now just returns the Google profile data)
router.put('/', authenticate, async (req, res) => {
  try {
    // Just return the Google profile data since we're not storing updates
    const { name, email, picture } = req.user;
    res.json({ 
      message: 'Profile data retrieved',
      user: {
        name: name,
        email: email,
        avatar: picture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
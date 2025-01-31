const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const User = require('../models/userModel');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user's watchlist
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      watchlist: user.watchlist || []
    });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist',
      error: error.message
    });
  }
});

// Add stock to watchlist
router.post('/', async (req, res) => {
  try {
    const { symbol, companyName, currentPrice, profitLoss } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const stockExists = user.watchlist.some(stock => stock.symbol === symbol);
    if (stockExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stock already in watchlist' 
      });
    }

    user.watchlist.push({
      symbol,
      companyName,
      currentPrice,
      profitLoss
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'Stock added to watchlist',
      watchlist: user.watchlist 
    });

  } catch (error) {
    console.error('Watchlist add error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add stock to watchlist',
      error: error.message 
    });
  }
});

// Remove stock from watchlist
router.delete('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.watchlist = user.watchlist.filter(stock => stock.symbol !== symbol);
    await user.save();

    res.json({
      success: true,
      message: 'Stock removed from watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watchlist',
      error: error.message
    });
  }
});

module.exports = router;

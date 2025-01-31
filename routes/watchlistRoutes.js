const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
const auth = require('../middleware/auth');

// Get user's watchlist
router.get('/', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    if (!watchlist) {
      const newWatchlist = await Watchlist.create({ 
        userId: req.user.id,
        symbols: []
      });
      return res.json(newWatchlist);
    }
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add symbol to watchlist
router.post('/add/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    let watchlist = await Watchlist.findOne({ userId: req.user.id });
    
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.user.id,
        symbols: [symbol]
      });
    } else if (!watchlist.symbols.includes(symbol)) {
      watchlist.symbols.push(symbol);
      watchlist.lastUpdated = Date.now();
      await watchlist.save();
    }
    
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove symbol from watchlist
router.delete('/remove/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const watchlist = await Watchlist.findOne({ userId: req.user.id });
    
    if (watchlist) {
      watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
      watchlist.lastUpdated = Date.now();
      await watchlist.save();
    }
    
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

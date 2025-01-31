const Watchlist = require('../models/watchlistModel');

const watchlistController = {
  // Add stock to watchlist
  addToWatchlist: async (req, res) => {
    try {
      const { userId } = req.user; // From auth middleware
      const { symbol } = req.body;

      let watchlist = await Watchlist.findOne({ user: userId });

      if (!watchlist) {
        // Create new watchlist if doesn't exist
        watchlist = new Watchlist({
          user: userId,
          symbols: [symbol]
        });
      } else if (!watchlist.symbols.includes(symbol)) {
        // Add symbol if not already in watchlist
        watchlist.symbols.push(symbol);
      }

      await watchlist.save();
      res.status(200).json({ success: true, watchlist });
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get user's watchlist
  getWatchlist: async (req, res) => {
    try {
      const { userId } = req.user;
      const watchlist = await Watchlist.findOne({ user: userId });
      res.status(200).json({ success: true, watchlist: watchlist?.symbols || [] });
    } catch (error) {
      console.error('Get watchlist error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Remove from watchlist
  removeFromWatchlist: async (req, res) => {
    try {
      const { userId } = req.user;
      const { symbol } = req.params;

      const watchlist = await Watchlist.findOne({ user: userId });
      if (watchlist) {
        watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
        await watchlist.save();
      }

      res.status(200).json({ success: true, watchlist });
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = watchlistController; 
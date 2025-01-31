const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stocks: [{
    symbol: {
      type: String,
      required: true
    },
    companyName: String,
    currentPrice: Number,
    profitLoss: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  name: {
    type: String,
    default: 'Default Watchlist'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);

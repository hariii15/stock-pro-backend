const mongoose = require('mongoose');

// Drop existing indexes on startup
async function dropIndexes() {
  try {
    await mongoose.model('Watchlist').collection.dropIndexes();
    console.log('Dropped all indexes from watchlist collection');
  } catch (error) {
    console.log('No indexes to drop or collection does not exist');
  }
}

const watchlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
    trim: true
  },
  symbols: {
    type: [String],
    validate: {
      validator: function(symbols) {
        return Array.isArray(symbols) && 
               symbols.every(symbol => symbol && /^[A-Z]{1,5}$/.test(symbol));
      },
      message: 'Invalid symbols in watchlist'
    },
    default: []
  }
}, {
  timestamps: true,
  strict: true // Prevent additional fields
});

// Clean up symbols before saving
watchlistSchema.pre('save', function(next) {
  if (this.symbols) {
    this.symbols = [...new Set(
      this.symbols
        .filter(Boolean) // Remove null/undefined values
        .map(symbol => symbol.toUpperCase().trim())
        .filter(symbol => /^[A-Z]{1,5}$/.test(symbol))
    )];
  }
  next();
});

watchlistSchema.methods.hasSymbol = function(symbol) {
  return symbol && this.symbols.includes(symbol.toUpperCase());
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

// Drop indexes when the model is first created
dropIndexes().catch(console.error);

module.exports = Watchlist;
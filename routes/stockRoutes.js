const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;
const authMiddleware = require('../middleware/auth.middleware');

// Remove duplicate middleware since it's already added in server.js
// router.use(authMiddleware);

// Add more stocks to this list for better search results
const STOCK_LIST = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE' },
  { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ' }
];

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Search endpoint - MUST come before the /:symbol route
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const searchTerm = query.toLowerCase();
    const suggestions = STOCK_LIST
      .filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm) ||
        stock.name.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5);

    res.json(suggestions);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to search stocks' 
    });
  }
});

// Individual stock data route - MUST come after more specific routes
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`Fetching stock data for ${symbol}`);

    // Fetch both current quote and historical data
    const [quote, historical] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
        period2: new Date(),
        interval: '1d'
      })
    ]);

    if (!quote || !historical) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Format the response
    const stockData = {
      symbol,
      currentData: {
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        companyName: quote.shortName || quote.longName,
        dayHigh: quote.dayHigh,
        dayLow: quote.dayLow,
        volume: quote.regularMarketVolume
      },
      historicalData: historical.map(day => ({
        date: day.date.toISOString().split('T')[0],
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        volume: day.volume
      }))
    };

    res.json(stockData);
  } catch (error) {
    console.error('Stock API Error:', error);
    res.status(500).json({ 
      message: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

module.exports = router;

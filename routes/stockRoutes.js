const express = require('express');
const router = express.Router();
const yahooFinance = require('yahoo-finance2').default;
const authMiddleware = require('../middleware/auth.middleware');

// Remove duplicate middleware since it's already added in server.js
// router.use(authMiddleware);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`Fetching stock data for ${symbol}, user:`, req.userId);

    const quote = await yahooFinance.quote(symbol);
    console.log('Quote data received:', quote);
    
    if (!quote) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Include more data in response
    const stockData = {
      symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      companyName: quote.shortName || quote.longName,
      dayHigh: quote.dayHigh,
      dayLow: quote.dayLow,
      volume: quote.regularMarketVolume
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

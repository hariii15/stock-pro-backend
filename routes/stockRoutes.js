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

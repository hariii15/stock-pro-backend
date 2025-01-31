const axios = require('axios');

// Utility function to validate stock symbol
const validateSymbol = (symbol) => {
  symbol = symbol.trim().toUpperCase();
  return /^[A-Z]{1,5}$/.test(symbol) ? symbol : null;
};

const getStockHistory = async (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = validateSymbol(symbol);
    
    if (!symbol) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      {
        params: {
          interval: '1d',
          range: '1mo'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0',
        }
      }
    );

    // Send raw data for debugging
    console.log('Yahoo Finance Response:', response.data);
    
    if (!response.data?.chart?.result?.[0]) {
      return res.status(404).json({ error: 'No data found for symbol' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.message 
    });
  }
};

const getStockQuote = async (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = validateSymbol(symbol);

    if (!symbol) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/quote`,
      {
        params: { symbols: symbol },
        headers: {
          'User-Agent': 'Mozilla/5.0',
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
};

module.exports = {
  getStockHistory,
  getStockQuote
};

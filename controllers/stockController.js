const yahooFinance = require('yahoo-finance2').default;

const stockController = {
  getStockData: async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      console.log(`Fetching stock data for ${symbol}`);

      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [quote, historical] = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.historical(symbol, {
          period1: thirtyDaysAgo,
          period2: new Date(),
          interval: '1d'
        })
      ]);

      if (!quote) {
        return res.status(404).json({ 
          success: false,
          message: 'Stock not found' 
        });
      }

      const stockData = {
        symbol,
        currentData: {
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          companyName: quote.shortName || quote.longName
        },
        historicalData: historical.map(day => ({
          date: day.date.toISOString().split('T')[0],
          close: day.close
        }))
      };

      res.json(stockData);
    } catch (error) {
      console.error('Stock API Error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch stock data',
        error: error.message 
      });
    }
  }
};

module.exports = stockController;

const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://stock-pro-frontend-one.vercel.app/',
  credentials: true
})); 
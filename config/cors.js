const cors = require('cors');

// Simplified CORS for Azure deployment
const corsOptions = {
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://lemon-moss-0af8f730f.1.azurestaticapps.net',
      'https://shipday-be.vercel.app',
      'http://192.168.0.54:8081',
      'http://192.168.0.54:5000',
      process.env.BASE_URL
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isAllowed = allowedOrigins.indexOf(origin) !== -1;

    if (isAllowed || isLocal) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
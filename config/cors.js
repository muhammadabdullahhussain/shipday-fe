const cors = require('cors');

// Simplified CORS for Azure deployment
const corsOptions = {
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'https://lemon-moss-0af8f730f.1.azurestaticapps.net',
      'https://shipday-be.vercel.app',
      'http://192.168.0.54:8081',
      'http://192.168.0.54:5000',
      process.env.BASE_URL,
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Dynamic check for production domain (with and without www)
    if (process.env.BASE_URL) {
      const baseUrl = process.env.BASE_URL.replace(/\/$/, ""); // Remove trailing slash
      if (!allowedOrigins.includes(baseUrl)) allowedOrigins.push(baseUrl);

      const wwwUrl = baseUrl.includes('www.') ? baseUrl.replace('www.', '') : baseUrl.replace('https://', 'https://www.');
      if (!allowedOrigins.includes(wwwUrl)) allowedOrigins.push(wwwUrl);
    }

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isAllowed = allowedOrigins.some(allowedOrigin => origin === allowedOrigin || origin.startsWith(allowedOrigin));

    if (isAllowed || isLocal) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
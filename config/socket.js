const socketIo = require('socket.io');

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://lemon-moss-0af8f730f.1.azurestaticapps.net',
  'http://192.168.0.54:8081',
  'http://192.168.0.54:5000',
];

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true
    },
    transports: ["websocket", "polling"],
  });

  return io;
};

module.exports = { initializeSocket };
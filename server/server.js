const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const {
  protect,
  errorHandler,
  setupProcessErrorHandlers,
} = require('./middleware');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGOURI', 'JWT_SECRET', 'CLIENT_URL'];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', { missing: missingVars });
  process.exit(1);
}

// Warn about missing optional vars
const missingOptional = optionalEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingOptional.length > 0 && process.env.NODE_ENV === 'production') {
  logger.warn('Missing optional environment variables:', { missing: missingOptional });
}

setupProcessErrorHandlers();

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Adjust based on your needs
  })
);

// CORS configuration - exact origin match required for Safari/Samsung Internet
// Safari requires exact domain match (no wildcard) when credentials: true
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // In production, only allow exact CLIENT_URL match (Safari requirement)
      if (process.env.NODE_ENV === 'production') {
        if (origin === allowedOrigin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        // In development, allow localhost and CLIENT_URL
        if (origin === allowedOrigin || origin.startsWith('http://localhost')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true, // Required for cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// Middleware to enforce Access-Control-Allow-Credentials header (required for Safari)
// This ensures Safari always receives the credentials header even if CORS middleware misses it
app.use((req, res, next) => {
  // Set Vary header (required for Safari to properly cache CORS responses)
  res.setHeader('Vary', 'Origin');
  // Explicitly set credentials header (Safari requires this to be present)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // If origin matches, set Access-Control-Allow-Origin (Safari requires exact match)
  const origin = req.headers.origin;
  if (origin && (origin === allowedOrigin || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware (should be after body parsers but before routes)
app.use(requestLogger);

app.get('/health', (req, res) => {
  const healthData = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
  };
  logger.info('Health check', { 
    uptime: healthData.uptime, 
    timestamp: healthData.timestamp 
  });
  res.status(200).json(healthData);
});

// Routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/categories', require('./routes/categories'));

const assistantLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/assistant', assistantLimiter, require('./routes/assistant'));

// 404 handler - catches all unmatched routes (must be before error handler)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { 
        port: PORT, 
        environment: process.env.NODE_ENV || 'development' 
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();

module.exports = app;

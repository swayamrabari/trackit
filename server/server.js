const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const User = require('./models/User');
const Entry = require('./models/Entries');
const Budget = require('./models/Budgets');
const {
  protect,
  errorHandler,
  setupProcessErrorHandlers,
} = require('./middleware');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGOURI',
  'JWT_SECRET',
  'CLIENT_URL',
  'BREVO_API_KEY',
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required environment variables:', {
    missing: missingVars,
  });
  process.exit(1);
}

// Warn about missing optional vars
const missingOptional = optionalEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingOptional.length > 0 && process.env.NODE_ENV === 'production') {
  logger.warn('Missing optional environment variables:', {
    missing: missingOptional,
  });
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

// CORS configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // In production, only allow CLIENT_URL
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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
  })
);

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
    timestamp: healthData.timestamp,
  });
  res.status(200).json(healthData);
});

app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));

// Routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: 'Too many requests. Please try again later.' },
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
  message: { message: 'You are sending requests too fast. Please wait a moment before asking another question.' },
});
app.use('/api/assistant', assistantLimiter, require('./routes/assistant'));

// 404 handler - catches all unmatched routes (must be before error handler)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Cleanup expired demo users
const cleanupExpiredDemos = async () => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expired = await User.find({ isDemo: true, createdAt: { $lt: cutoff } });
    const ids = expired.map((u) => u._id);
    if (ids.length > 0) {
      await Promise.all([
        Entry.deleteMany({ userId: { $in: ids } }),
        Budget.deleteMany({ userId: { $in: ids } }),
        User.deleteMany({ _id: { $in: ids } }),
      ]);
      logger.info(`Cleaned up ${ids.length} expired demo sessions`);
    }
  } catch (error) {
    logger.error('Demo cleanup error', { message: error.message });
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    await cleanupExpiredDemos();
    setInterval(cleanupExpiredDemos, 6 * 60 * 60 * 1000);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;

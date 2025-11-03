const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
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
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error('\nPlease set these in your .env file');
  process.exit(1);
}

// Warn about missing optional vars
const missingOptional = optionalEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingOptional.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  Missing optional environment variables:');
  missingOptional.forEach((varName) => console.warn(`   - ${varName}`));
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

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

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
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const kambioRoutes = require('./routes/kambios');
const transactionRoutes = require('./routes/transactions');
const expenseCategoryRoutes = require('./routes/expenseCategories');
const nudgeRoutes = require('./routes/nudges');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Kambio API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/kambios', kambioRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/nudges', nudgeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

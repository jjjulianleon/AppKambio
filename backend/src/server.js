require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./models');
const { initializeNudgeScheduler } = require('./services/nudgeService');
const { initializeDefaultPool } = require('./utils/poolInitializer');

const PORT = process.env.PORT || 3000;

// Startup function
const startServer = async () => {
  try {
    console.log('🚀 Starting Kambio Backend Server...\n');

    // Test database connection
    console.log('📊 Connecting to database...');
    await testConnection();

    // Initialize database models
    console.log('📦 Initializing database models...');
    await initializeDatabase();

    // Initialize nudge scheduler
    console.log('⏰ Initializing nudge scheduler...');
    initializeNudgeScheduler();

    // Initialize default savings pool
    console.log('🤝 Initializing savings pool...');
    await initializeDefaultPool();

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Server is running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`📱 Mobile URL: http://172.21.138.188:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`\n🎯 Kambio API ready to receive requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

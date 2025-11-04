const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = new Sequelize(process.env.DATABASE_URL, config);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

// Export for Sequelize CLI
module.exports = {
  development: config,
  production: config,
  test: config,
  sequelize,
  testConnection
};

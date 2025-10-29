const { sequelize } = require('../config/database');
const User = require('./User');
const FinancialProfile = require('./FinancialProfile');
const Goal = require('./Goal');
const ExpenseCategory = require('./ExpenseCategory');
const Transaction = require('./Transaction');
const Kambio = require('./Kambio');
const NudgeSetting = require('./NudgeSetting');

// Define relationships
// User relationships
User.hasOne(FinancialProfile, { foreignKey: 'user_id', as: 'financialProfile' });
User.hasMany(Goal, { foreignKey: 'user_id', as: 'goals' });
User.hasMany(ExpenseCategory, { foreignKey: 'user_id', as: 'expenseCategories' });
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' });
User.hasMany(Kambio, { foreignKey: 'user_id', as: 'kambios' });
User.hasOne(NudgeSetting, { foreignKey: 'user_id', as: 'nudgeSetting' });

// Reverse relationships
FinancialProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Goal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ExpenseCategory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Kambio.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
NudgeSetting.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Kambio relationships
Kambio.belongsTo(Goal, { foreignKey: 'goal_id', as: 'goal' });
Kambio.belongsTo(ExpenseCategory, { foreignKey: 'expense_category_id', as: 'expenseCategory' });
Goal.hasMany(Kambio, { foreignKey: 'goal_id', as: 'kambios' });
ExpenseCategory.hasMany(Kambio, { foreignKey: 'expense_category_id', as: 'kambios' });

// Initialize database
const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized successfully.');
  } catch (error) {
    console.error('✗ Error synchronizing database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  FinancialProfile,
  Goal,
  ExpenseCategory,
  Transaction,
  Kambio,
  NudgeSetting,
  initializeDatabase
};

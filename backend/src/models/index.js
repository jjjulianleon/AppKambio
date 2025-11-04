const { sequelize } = require('../config/database');
const User = require('./User');
const FinancialProfile = require('./FinancialProfile');
const Goal = require('./Goal');
const ExpenseCategory = require('./ExpenseCategory');
const Transaction = require('./Transaction');
const Kambio = require('./Kambio');
const NudgeSetting = require('./NudgeSetting');
const SavingsPool = require('./SavingsPool');
const PoolMembership = require('./PoolMembership');
const PoolRequest = require('./PoolRequest');
const PoolContribution = require('./PoolContribution');

// Initialize Split Bill models
const ExpenseShare = require('./ExpenseShare')(sequelize);
const ExpenseShareMember = require('./ExpenseShareMember')(sequelize);
const ExpenseShareItem = require('./ExpenseShareItem')(sequelize);

// Initialize Battle Pass models
const BattlePass = require('./BattlePass')(sequelize);
const BattlePassReward = require('./BattlePassReward')(sequelize);
const UserReward = require('./UserReward')(sequelize);
const BattlePassChallenge = require('./BattlePassChallenge')(sequelize);
const UserChallenge = require('./UserChallenge')(sequelize);

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

// Savings Pool relationships
// Pool memberships
SavingsPool.hasMany(PoolMembership, { foreignKey: 'pool_id', as: 'memberships' });
PoolMembership.belongsTo(SavingsPool, { foreignKey: 'pool_id', as: 'pool' });
User.hasMany(PoolMembership, { foreignKey: 'user_id', as: 'poolMemberships' });
PoolMembership.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Pool requests
SavingsPool.hasMany(PoolRequest, { foreignKey: 'pool_id', as: 'requests' });
PoolRequest.belongsTo(SavingsPool, { foreignKey: 'pool_id', as: 'pool' });
User.hasMany(PoolRequest, { foreignKey: 'requester_id', as: 'poolRequests' });
PoolRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });

// Pool contributions
PoolRequest.hasMany(PoolContribution, { foreignKey: 'request_id', as: 'contributions' });
PoolContribution.belongsTo(PoolRequest, { foreignKey: 'request_id', as: 'request' });
User.hasMany(PoolContribution, { foreignKey: 'contributor_id', as: 'poolContributions' });
PoolContribution.belongsTo(User, { foreignKey: 'contributor_id', as: 'contributor' });

// Expense Share relationships
ExpenseShare.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });
User.hasMany(ExpenseShare, { foreignKey: 'user_id', as: 'expenseShares' });

ExpenseShare.hasMany(ExpenseShareMember, { foreignKey: 'share_id', as: 'members' });
ExpenseShareMember.belongsTo(ExpenseShare, { foreignKey: 'share_id', as: 'expenseShare' });
ExpenseShareMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ExpenseShareMember, { foreignKey: 'user_id', as: 'expenseShareMemberships' });

ExpenseShare.hasMany(ExpenseShareItem, { foreignKey: 'share_id', as: 'items' });
ExpenseShareItem.belongsTo(ExpenseShare, { foreignKey: 'share_id', as: 'expenseShare' });
ExpenseShareItem.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Battle Pass relationships
BattlePass.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(BattlePass, { foreignKey: 'user_id', as: 'battlePasses' });

BattlePassReward.hasMany(UserReward, { foreignKey: 'reward_id', as: 'userRewards' });

UserReward.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserReward.belongsTo(BattlePass, { foreignKey: 'battle_pass_id', as: 'battlePass' });
UserReward.belongsTo(BattlePassReward, { foreignKey: 'reward_id', as: 'reward' });
User.hasMany(UserReward, { foreignKey: 'user_id', as: 'userRewards' });
BattlePass.hasMany(UserReward, { foreignKey: 'battle_pass_id', as: 'rewards' });

BattlePassChallenge.hasMany(UserChallenge, { foreignKey: 'challenge_id', as: 'userChallenges' });

UserChallenge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserChallenge.belongsTo(BattlePassChallenge, { foreignKey: 'challenge_id', as: 'challenge' });
User.hasMany(UserChallenge, { foreignKey: 'user_id', as: 'userChallenges' });

// Initialize database 
const initializeDatabase = async () => {
  try {
    // Solo verificar la conexión, no alterar tablas
    // Las migraciones manejan los cambios de esquema
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
  } catch (error) {
    console.error('✗ Error connecting to database:', error.message);
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
  SavingsPool,
  PoolMembership,
  PoolRequest,
  PoolContribution,
  ExpenseShare,
  ExpenseShareMember,
  ExpenseShareItem,
  BattlePass,
  BattlePassReward,
  UserReward,
  BattlePassChallenge,
  UserChallenge,
  initializeDatabase
};

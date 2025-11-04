const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PoolContribution = sequelize.define('PoolContribution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'pool_requests',
      key: 'id'
    }
  },
  contributor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  contributed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pool_contributions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PoolContribution;

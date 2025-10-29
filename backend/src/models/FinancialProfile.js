const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancialProfile = sequelize.define('FinancialProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  savings_barrier: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '¿Qué te impide ahorrar?'
  },
  motivation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '¿Qué te motiva a ahorrar?'
  },
  spending_personality: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Tipo de personalidad de gasto'
  }
}, {
  tableName: 'financial_profiles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = FinancialProfile;

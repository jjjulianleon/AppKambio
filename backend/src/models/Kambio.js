const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Kambio = sequelize.define('Kambio', {
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
  goal_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'goals',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  expense_category_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'expense_categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
    defaultValue: 'credit',
    comment: 'credit = ahorro, debit = contribución al pozo'
  },
  pool_contribution_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'pool_contributions',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID de la contribución al pozo si es un débito'
  },
  pool_request_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'pool_requests',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID de la solicitud del pozo si es un crédito por solicitud completada'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'ej. "Evité comprar café"'
  }
}, {
  tableName: 'kambios',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Kambio;

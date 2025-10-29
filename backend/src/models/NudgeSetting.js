const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NudgeSetting = sequelize.define('NudgeSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  time_1: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '10:00:00',
    comment: 'Primera notificación del día'
  },
  time_2: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '15:00:00',
    comment: 'Segunda notificación del día'
  },
  time_3: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '20:00:00',
    comment: 'Tercera notificación del día'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'nudge_settings',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = NudgeSetting;

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExpenseShareItem = sequelize.define('ExpenseShareItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    share_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'expense_shares',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Name of the item'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price of the item'
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'User who is assigned this item'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'expense_share_items',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExpenseShareItem.associate = (models) => {
    ExpenseShareItem.belongsTo(models.ExpenseShare, {
      foreignKey: 'share_id',
      as: 'expense_share'
    });

    ExpenseShareItem.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignee'
    });
  };

  return ExpenseShareItem;
};

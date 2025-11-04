const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExpenseShareMember = sequelize.define('ExpenseShareMember', {
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    amount_owed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount this member owes'
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Amount this member has paid'
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Percentage for percentage-based splits'
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SETTLED'),
      allowNull: false,
      defaultValue: 'PENDING'
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
    tableName: 'expense_share_members',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExpenseShareMember.associate = (models) => {
    ExpenseShareMember.belongsTo(models.ExpenseShare, {
      foreignKey: 'share_id',
      as: 'expense_share'
    });

    ExpenseShareMember.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ExpenseShareMember;
};

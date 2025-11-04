const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExpenseShare = sequelize.define('ExpenseShare', {
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
      onDelete: 'CASCADE',
      comment: 'Creator of the expense share'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the shared expense'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Total amount to be split'
    },
    split_type: {
      type: DataTypes.ENUM('EQUAL', 'CUSTOM', 'PERCENTAGE', 'ITEMS'),
      allowNull: false,
      defaultValue: 'EQUAL',
      comment: 'Type of split: equal, custom amounts, percentage, or by items'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the expense'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'SETTLED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
      comment: 'Status of the expense share'
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
    tableName: 'expense_shares',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExpenseShare.associate = (models) => {
    ExpenseShare.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'creator'
    });

    ExpenseShare.hasMany(models.ExpenseShareMember, {
      foreignKey: 'share_id',
      as: 'members',
      onDelete: 'CASCADE'
    });

    ExpenseShare.hasMany(models.ExpenseShareItem, {
      foreignKey: 'share_id',
      as: 'items',
      onDelete: 'CASCADE'
    });
  };

  // Instance methods
  ExpenseShare.prototype.calculateSplit = async function() {
    const members = await this.getMembers();

    switch (this.split_type) {
      case 'EQUAL':
        const equalAmount = parseFloat(this.total_amount) / members.length;
        return members.map(member => ({
          ...member.toJSON(),
          amount_owed: equalAmount
        }));

      case 'CUSTOM':
        return members.map(member => ({
          ...member.toJSON(),
          amount_owed: parseFloat(member.amount_owed)
        }));

      case 'PERCENTAGE':
        return members.map(member => ({
          ...member.toJSON(),
          amount_owed: (parseFloat(this.total_amount) * parseFloat(member.percentage)) / 100
        }));

      case 'ITEMS':
        const items = await this.getItems();
        const memberAmounts = {};
        items.forEach(item => {
          if (!memberAmounts[item.assigned_to]) {
            memberAmounts[item.assigned_to] = 0;
          }
          memberAmounts[item.assigned_to] += parseFloat(item.price);
        });
        return members.map(member => ({
          ...member.toJSON(),
          amount_owed: memberAmounts[member.user_id] || 0
        }));

      default:
        return members;
    }
  };

  ExpenseShare.prototype.getDebtSummary = async function() {
    const members = await this.calculateSplit();

    return members.map(member => ({
      user_id: member.user_id,
      amount_owed: member.amount_owed,
      amount_paid: member.amount_paid,
      balance: parseFloat(member.amount_owed) - parseFloat(member.amount_paid),
      status: member.status
    }));
  };

  return ExpenseShare;
};

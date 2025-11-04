const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserReward = sequelize.define('UserReward', {
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
    battle_pass_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'battle_passes',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    reward_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'battle_pass_rewards',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    earned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'USED', 'EXPIRED'),
      allowNull: false,
      defaultValue: 'AVAILABLE'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Discount code if applicable'
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
    tableName: 'user_rewards',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserReward.associate = (models) => {
    UserReward.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserReward.belongsTo(models.BattlePass, {
      foreignKey: 'battle_pass_id',
      as: 'battlePass'
    });

    UserReward.belongsTo(models.BattlePassReward, {
      foreignKey: 'reward_id',
      as: 'reward'
    });
  };

  return UserReward;
};

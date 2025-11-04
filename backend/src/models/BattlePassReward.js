const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BattlePassReward = sequelize.define('BattlePassReward', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Level required to unlock (1-7)'
    },
    min_savings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Minimum savings required'
    },
    max_savings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Maximum savings for this level (null for highest level)'
    },
    reward_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Title of the reward'
    },
    reward_description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Description of the reward'
    },
    reward_category: {
      type: DataTypes.ENUM('DISCOUNT', 'POINTS', 'BADGE', 'UNLOCK', 'EXPERIENCE'),
      allowNull: false,
      comment: 'Category of reward'
    },
    reward_value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON string with reward details'
    },
    icon_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL or emoji for icon'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'battle_pass_rewards',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  BattlePassReward.associate = (models) => {
    BattlePassReward.hasMany(models.UserReward, {
      foreignKey: 'reward_id',
      as: 'userRewards'
    });
  };

  return BattlePassReward;
};

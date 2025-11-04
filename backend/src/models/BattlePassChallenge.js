const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BattlePassChallenge = sequelize.define('BattlePassChallenge', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    challenge_type: {
      type: DataTypes.ENUM('STREAK', 'TARGET', 'CATEGORY'),
      allowNull: false,
      comment: 'Type of challenge: streak (consecutive days), target (save X amount), category (save in specific category)'
    },
    target_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Target value to complete (days for STREAK, amount for TARGET/CATEGORY)'
    },
    bonus_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Bonus points awarded on completion'
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
      comment: 'Duration of the challenge in days'
    },
    icon_url: {
      type: DataTypes.STRING(500),
      allowNull: true
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
    tableName: 'battle_pass_challenges',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  BattlePassChallenge.associate = (models) => {
    BattlePassChallenge.hasMany(models.UserChallenge, {
      foreignKey: 'challenge_id',
      as: 'userChallenges'
    });
  };

  return BattlePassChallenge;
};

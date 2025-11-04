const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserChallenge = sequelize.define('UserChallenge', {
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
    challenge_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'battle_pass_challenges',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current progress towards target'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Challenge expiration date'
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
    tableName: 'user_challenges',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserChallenge.associate = (models) => {
    UserChallenge.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserChallenge.belongsTo(models.BattlePassChallenge, {
      foreignKey: 'challenge_id',
      as: 'challenge'
    });
  };

  // Instance methods
  UserChallenge.prototype.updateProgress = async function(amount) {
    this.progress += parseInt(amount);

    // Check if completed
    const challenge = await this.getChallenge();
    if (this.progress >= challenge.target_value) {
      this.completed = true;
      this.completed_at = new Date();
    }

    await this.save();
    return this;
  };

  return UserChallenge;
};

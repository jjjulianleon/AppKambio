const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BattlePass = sequelize.define('BattlePass', {
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
      comment: 'User who owns this battle pass'
    },
    month: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Month for this battle pass (YYYY-MM-01)'
    },
    current_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current level (0-7)'
    },
    total_savings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Total amount saved this month'
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total points earned'
    },
    completed_challenges: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
      comment: 'Array of completed challenge IDs'
    },
    streak_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Consecutive days with savings'
    },
    last_activity_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Last date user saved money'
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
    tableName: 'battle_passes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'month']
      }
    ]
  });

  BattlePass.associate = (models) => {
    BattlePass.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    BattlePass.hasMany(models.UserReward, {
      foreignKey: 'battle_pass_id',
      as: 'rewards'
    });
  };

  // Instance methods
  BattlePass.prototype.updateSavings = async function(amount) {
    const newTotal = parseFloat(this.total_savings) + parseFloat(amount);
    this.total_savings = newTotal;

    // Update points (1 peso = 1 point)
    this.total_points += parseInt(amount);

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (this.last_activity_date) {
      const lastDate = new Date(this.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.streak_days += 1;
        // Bonus for 7+ day streak
        if (this.streak_days >= 7) {
          this.total_points += parseInt(amount * 0.5); // +50% bonus
        }
      } else if (diffDays > 1) {
        this.streak_days = 1;
      }
    } else {
      this.streak_days = 1;
    }

    this.last_activity_date = today;

    // Calculate new level
    this.current_level = this.calculateLevel();

    await this.save();

    return this;
  };

  BattlePass.prototype.calculateLevel = function() {
    const savings = parseFloat(this.total_savings);

    // Level thresholds
    if (savings >= 300) return 7;
    if (savings >= 200) return 6;
    if (savings >= 150) return 5;
    if (savings >= 100) return 4;
    if (savings >= 75) return 3;
    if (savings >= 50) return 2;
    if (savings >= 25) return 1;
    return 0;
  };

  BattlePass.prototype.getProgressPercentage = function() {
    const savings = parseFloat(this.total_savings);
    const maxSavings = 300;

    return Math.min(100, (savings / maxSavings) * 100);
  };

  BattlePass.prototype.getNextLevelThreshold = function() {
    const thresholds = [25, 50, 75, 100, 150, 200, 300];
    const currentSavings = parseFloat(this.total_savings);

    for (const threshold of thresholds) {
      if (currentSavings < threshold) {
        return {
          amount: threshold,
          remaining: threshold - currentSavings
        };
      }
    }

    return null; // Max level reached
  };

  return BattlePass;
};

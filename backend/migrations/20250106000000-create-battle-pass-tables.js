'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create battle_passes table
    await queryInterface.createTable('battle_passes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      month: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      current_level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_savings: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      completed_challenges: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: false,
        defaultValue: []
      },
      streak_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_activity_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create battle_pass_rewards table
    await queryInterface.createTable('battle_pass_rewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      min_savings: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      max_savings: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      reward_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      reward_description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      reward_category: {
        type: Sequelize.ENUM('DISCOUNT', 'POINTS', 'BADGE', 'UNLOCK', 'EXPERIENCE'),
        allowNull: false
      },
      reward_value: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      icon_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create user_rewards table
    await queryInterface.createTable('user_rewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      battle_pass_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'battle_passes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      reward_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'battle_pass_rewards',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      earned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('AVAILABLE', 'USED', 'EXPIRED'),
        allowNull: false,
        defaultValue: 'AVAILABLE'
      },
      code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create battle_pass_challenges table
    await queryInterface.createTable('battle_pass_challenges', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      challenge_type: {
        type: Sequelize.ENUM('STREAK', 'TARGET', 'CATEGORY'),
        allowNull: false
      },
      target_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bonus_points: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 7
      },
      icon_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create user_challenges table
    await queryInterface.createTable('user_challenges', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      challenge_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'battle_pass_challenges',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('battle_passes', ['user_id', 'month'], {
      unique: true,
      name: 'battle_passes_user_month_unique'
    });
    await queryInterface.addIndex('battle_pass_rewards', ['level']);
    await queryInterface.addIndex('user_rewards', ['user_id']);
    await queryInterface.addIndex('user_rewards', ['battle_pass_id']);
    await queryInterface.addIndex('user_challenges', ['user_id']);
    await queryInterface.addIndex('user_challenges', ['challenge_id']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('user_challenges');
    await queryInterface.dropTable('battle_pass_challenges');
    await queryInterface.dropTable('user_rewards');
    await queryInterface.dropTable('battle_pass_rewards');
    await queryInterface.dropTable('battle_passes');
  }
};

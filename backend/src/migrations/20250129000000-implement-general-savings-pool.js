'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create user_savings table
    await queryInterface.createTable('user_savings', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      total_saved: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint for user_id + month + year
    await queryInterface.addConstraint('user_savings', {
      fields: ['user_id', 'month', 'year'],
      type: 'unique',
      name: 'unique_user_month_year'
    });

    // 2. Add completed_amount to goals table
    await queryInterface.addColumn('goals', 'completed_amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });

    // 3. Make goal_id nullable in kambios table (for general savings)
    await queryInterface.changeColumn('kambios', 'goal_id', {
      type: Sequelize.UUID,
      allowNull: true, // Changed from false to true
      references: {
        model: 'goals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 4. Add transaction_type to kambios if it doesn't exist
    const kambiosTableInfo = await queryInterface.describeTable('kambios');
    if (!kambiosTableInfo.transaction_type) {
      await queryInterface.addColumn('kambios', 'transaction_type', {
        type: Sequelize.ENUM('save', 'complete_goal', 'pool_contribution', 'pool_receive'),
        allowNull: false,
        defaultValue: 'save'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove transaction_type from kambios
    await queryInterface.removeColumn('kambios', 'transaction_type');

    // Revert goal_id to non-nullable in kambios
    await queryInterface.changeColumn('kambios', 'goal_id', {
      type: Sequelize.UUID,
      allowNull: false
    });

    // Remove completed_amount from goals
    await queryInterface.removeColumn('goals', 'completed_amount');

    // Drop user_savings table
    await queryInterface.dropTable('user_savings');
  }
};

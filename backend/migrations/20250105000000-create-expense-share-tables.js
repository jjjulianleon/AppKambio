'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create expense_shares table
    await queryInterface.createTable('expense_shares', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      split_type: {
        type: Sequelize.ENUM('EQUAL', 'CUSTOM', 'PERCENTAGE', 'ITEMS'),
        allowNull: false,
        defaultValue: 'EQUAL'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'SETTLED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
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

    // Create expense_share_members table
    await queryInterface.createTable('expense_share_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      share_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'expense_shares',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      amount_owed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'SETTLED'),
        allowNull: false,
        defaultValue: 'PENDING'
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

    // Create expense_share_items table
    await queryInterface.createTable('expense_share_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      share_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'expense_shares',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('expense_shares', ['user_id']);
    await queryInterface.addIndex('expense_shares', ['status']);
    await queryInterface.addIndex('expense_share_members', ['share_id']);
    await queryInterface.addIndex('expense_share_members', ['user_id']);
    await queryInterface.addIndex('expense_share_items', ['share_id']);
    await queryInterface.addIndex('expense_share_items', ['assigned_to']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('expense_share_items');
    await queryInterface.dropTable('expense_share_members');
    await queryInterface.dropTable('expense_shares');
  }
};

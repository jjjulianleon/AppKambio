const { sequelize } = require('../config/database');
const { QueryInterface } = require('sequelize');

async function runMigration() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔄 Starting migration...\n');

    // 1. Create user_savings table
    console.log('Creating user_savings table...');
    await queryInterface.createTable('user_savings', {
      id: {
        type: sequelize.Sequelize.UUID,
        defaultValue: sequelize.Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: sequelize.Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      total_saved: {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      month: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
      },
      year: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('user_savings', {
      fields: ['user_id', 'month', 'year'],
      type: 'unique',
      name: 'unique_user_month_year'
    });
    console.log('✓ user_savings table created\n');

    // 2. Add completed_amount to goals
    console.log('Adding completed_amount to goals...');
    await queryInterface.addColumn('goals', 'completed_amount', {
      type: sequelize.Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });
    console.log('✓ completed_amount added\n');

    // 3. Check if goal_id is already nullable
    console.log('Checking goal_id column in kambios...');
    const kambiosTableInfo = await queryInterface.describeTable('kambios');

    if (!kambiosTableInfo.goal_id.allowNull) {
      console.log('Making goal_id nullable...');
      await queryInterface.changeColumn('kambios', 'goal_id', {
        type: sequelize.Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'goals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      console.log('✓ goal_id is now nullable\n');
    } else {
      console.log('✓ goal_id already nullable\n');
    }

    // 4. Check if transaction_type exists
    console.log('Checking transaction_type column...');
    if (!kambiosTableInfo.transaction_type) {
      console.log('Adding transaction_type to kambios...');
      await queryInterface.addColumn('kambios', 'transaction_type', {
        type: sequelize.Sequelize.ENUM('save', 'complete_goal', 'pool_contribution', 'pool_receive'),
        allowNull: false,
        defaultValue: 'save'
      });
      console.log('✓ transaction_type added\n');
    } else {
      console.log('✓ transaction_type already exists\n');
    }

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

runMigration();

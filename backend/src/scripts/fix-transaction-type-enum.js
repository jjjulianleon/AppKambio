const { sequelize } = require('../models');

async function fixTransactionTypeEnum() {
  try {
    console.log('🔧 Fixing transaction_type enum...');

    // First, check current enum values
    const checkEnumQuery = `
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid
        FROM pg_type
        WHERE typname = 'enum_kambios_transaction_type'
      );
    `;

    const currentValues = await sequelize.query(checkEnumQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('Current enum values:', currentValues.map(v => v.enumlabel));

    // Add new values to the enum if they don't exist
    const newValues = ['save', 'complete_goal', 'pool_contribution', 'pool_receive'];

    for (const value of newValues) {
      const exists = currentValues.some(v => v.enumlabel === value);
      if (!exists) {
        console.log(`Adding enum value: ${value}`);
        await sequelize.query(`
          ALTER TYPE enum_kambios_transaction_type ADD VALUE IF NOT EXISTS '${value}';
        `);
      } else {
        console.log(`✓ Enum value already exists: ${value}`);
      }
    }

    console.log('✅ Transaction type enum fixed successfully!');

    // Show final enum values
    const finalValues = await sequelize.query(checkEnumQuery, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('Final enum values:', finalValues.map(v => v.enumlabel));

  } catch (error) {
    console.error('❌ Error fixing enum:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixTransactionTypeEnum();

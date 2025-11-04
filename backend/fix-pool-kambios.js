require('dotenv').config();
const { Kambio } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function fixPoolKambios() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Update all kambios with pool_contribution_id to be 'debit'
    const [updatedCount] = await Kambio.update(
      { transaction_type: 'debit' },
      {
        where: {
          pool_contribution_id: {
            [require('sequelize').Op.ne]: null
          }
        }
      }
    );

    console.log(`✓ Updated ${updatedCount} contribution kambios to 'debit' type`);

    // Update all kambios with pool_request_id to be 'credit'
    const [updatedCount2] = await Kambio.update(
      { transaction_type: 'credit' },
      {
        where: {
          pool_request_id: {
            [require('sequelize').Op.ne]: null
          }
        }
      }
    );

    console.log(`✓ Updated ${updatedCount2} received kambios to 'credit' type`);

    console.log('\n✅ Pool kambios fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing pool kambios:', error);
    process.exit(1);
  }
}

fixPoolKambios();

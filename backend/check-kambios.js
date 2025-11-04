require('dotenv').config();
const { Kambio } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function checkKambios() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Get all kambios
    const kambios = await Kambio.findAll({
      attributes: [
        'id',
        'description',
        'amount',
        'transaction_type',
        'pool_contribution_id',
        'pool_request_id',
        'created_at'
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log('\nLast 10 kambios:');
    kambios.forEach(k => {
      console.log({
        id: k.id,
        amount: k.amount,
        type: k.transaction_type,
        pool_contribution_id: k.pool_contribution_id,
        pool_request_id: k.pool_request_id,
        description: k.description?.substring(0, 50)
      });
    });

    // Count kambios by type
    const creditCount = await Kambio.count({ where: { transaction_type: 'credit' } });
    const debitCount = await Kambio.count({ where: { transaction_type: 'debit' } });

    console.log(`\n✓ Credit kambios: ${creditCount}`);
    console.log(`✓ Debit kambios: ${debitCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkKambios();

const { Transaction } = require('../models');
const { sequelize } = require('../config/database');

async function fixTransactionAmounts() {
  try {
    console.log('🔧 Fixing transaction amounts...\n');

    // Get all transactions
    const transactions = await Transaction.findAll();
    console.log(`Found ${transactions.length} transactions\n`);

    let updated = 0;

    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount);

      // If the transaction has a category (expense) and is positive, make it negative
      if (transaction.category && amount > 0) {
        transaction.amount = -Math.abs(amount);
        await transaction.save();
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} transactions to negative amounts\n`);

    // Verify the changes
    const negativeCount = await Transaction.count({
      where: {
        amount: {
          [sequelize.Sequelize.Op.lt]: 0
        }
      }
    });

    const positiveCount = await Transaction.count({
      where: {
        amount: {
          [sequelize.Sequelize.Op.gte]: 0
        }
      }
    });

    console.log('📊 Final count:');
    console.log(`  Negative amounts (gastos): ${negativeCount}`);
    console.log(`  Positive amounts (ingresos): ${positiveCount}\n`);

    // Show sample
    const samples = await Transaction.findAll({
      limit: 5,
      where: {
        amount: {
          [sequelize.Sequelize.Op.lt]: 0
        }
      },
      order: [['transaction_date', 'DESC']]
    });

    console.log('📝 Sample gastos:');
    samples.forEach(t => {
      console.log(`  ${t.category}: $${t.amount} - ${t.description}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixTransactionAmounts();

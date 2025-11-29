const { Transaction } = require('../models');
const { sequelize } = require('../config/database');

async function checkTransactions() {
  try {
    console.log('📊 Checking transactions...\n');

    const transactions = await Transaction.findAll({
      limit: 20,
      order: [['transaction_date', 'DESC']]
    });

    console.log(`Total transactions checked: ${transactions.length}\n`);

    // Group by category
    const byCategory = {};
    const byAmount = { positive: 0, negative: 0 };

    transactions.forEach(t => {
      const cat = t.category || 'Sin categoría';
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, total: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].total += parseFloat(t.amount);

      if (parseFloat(t.amount) >= 0) {
        byAmount.positive++;
      } else {
        byAmount.negative++;
      }
    });

    console.log('📈 By amount type:');
    console.log(`  Positive (ingresos): ${byAmount.positive}`);
    console.log(`  Negative (gastos): ${byAmount.negative}\n`);

    console.log('📂 By category:');
    Object.keys(byCategory).forEach(cat => {
      console.log(`  ${cat}: ${byCategory[cat].count} transactions, Total: $${byCategory[cat].total.toFixed(2)}`);
    });

    console.log('\n📝 Sample transactions:');
    transactions.slice(0, 5).forEach(t => {
      console.log(`  Date: ${t.transaction_date.toISOString().split('T')[0]}, Amount: $${t.amount}, Category: ${t.category || 'None'}, Description: ${t.description || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkTransactions();

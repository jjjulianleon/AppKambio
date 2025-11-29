const { Transaction } = require('../models');
const { sequelize } = require('../config/database');

async function showAIData() {
  try {
    console.log('📊 Datos que el Coach AI está analizando:\n');

    // Get current month transactions (same as AI does)
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const transactions = await Transaction.findAll({
      where: {
        transaction_date: {
          [sequelize.Sequelize.Op.between]: [firstDay, lastDay]
        }
      },
      limit: 50,
      order: [['transaction_date', 'DESC']]
    });

    console.log(`Total de transacciones del mes actual: ${transactions.length}\n`);

    // Group by category
    const byCategory = {};
    let total = 0;

    transactions.forEach(t => {
      const cat = t.category || 'Sin categoría';
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, total: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].total += Math.abs(parseFloat(t.amount));
      total += Math.abs(parseFloat(t.amount));
    });

    console.log('📂 Resumen por categoría:');
    Object.keys(byCategory).forEach(cat => {
      const percentage = ((byCategory[cat].total / total) * 100).toFixed(1);
      console.log(`  ${cat}: ${byCategory[cat].count} gastos = $${byCategory[cat].total.toFixed(2)} (${percentage}%)`);
    });

    console.log(`\n💰 Total gastado: $${total.toFixed(2)}\n`);

    console.log('📝 Ejemplos de gastos (primeros 10):');
    transactions.slice(0, 10).forEach((t, i) => {
      const date = t.transaction_date.toISOString().split('T')[0];
      console.log(`  ${i+1}. [${date}] ${t.category}: $${Math.abs(t.amount)} - ${t.description}`);
    });

    console.log('\n✅ Estos son los datos que el Coach AI analiza para darte consejos.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

showAIData();

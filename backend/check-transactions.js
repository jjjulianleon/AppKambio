const { User, Transaction } = require('./src/models');

async function checkTransactions() {
  try {
    const users = await User.findAll();

    console.log('📊 Estado de transacciones en la base de datos:\n');
    console.log('═══════════════════════════════════════════════════\n');

    let totalTransactions = 0;

    for (const user of users) {
      const count = await Transaction.count({ where: { user_id: user.id } });
      totalTransactions += count;

      const icon = count > 0 ? '✅' : '❌';
      console.log(`${icon} ${user.full_name.padEnd(20)} ${count} transacciones`);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`📈 TOTAL: ${totalTransactions} transacciones en la base de datos\n`);

    if (totalTransactions === 0) {
      console.log('💡 No hay transacciones mockup generadas aún.');
      console.log('   Para generar transacciones, ejecuta:');
      console.log('   node generate-mock-data.js\n');
    } else {
      console.log('✅ Hay transacciones mockup disponibles para análisis de Insights AI\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTransactions();

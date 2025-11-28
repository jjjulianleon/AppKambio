const {
  User,
  Goal,
  Kambio,
  BattlePass,
  PoolRequest,
  PoolContribution,
  ExpenseCategory,
  Transaction
} = require('./src/models');

async function verifyDemoData() {
  console.log('📊 VERIFICACIÓN DE DATA DE DEMO\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    const users = await User.findAll();

    for (const user of users) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 ${user.full_name.toUpperCase()} (${user.email})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Metas
      const goals = await Goal.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']]
      });

      console.log(`🎯 METAS (${goals.length}):`);
      goals.forEach(g => {
        const progress = Math.round((g.current_amount / g.target_amount) * 100);
        const icon = g.status === 'completed' ? '🏆' : '📊';
        console.log(`   ${icon} ${g.name}: $${g.current_amount}/$${g.target_amount} (${progress}%)`);
      });

      // Kambios
      const kambios = await Kambio.count({ where: { user_id: user.id } });
      const totalSaved = await Kambio.sum('amount', { where: { user_id: user.id } }) || 0;
      console.log(`\n💰 KAMBIOS: ${kambios} registros ($${totalSaved.toFixed(2)} total)`);

      // Battle Pass
      const monthKey = new Date().toISOString().split('T')[0].slice(0, 7) + '-01';
      const battlePass = await BattlePass.findOne({
        where: { user_id: user.id, month: monthKey }
      });

      if (battlePass) {
        console.log(`\n🏆 BATTLE PASS:`);
        console.log(`   Nivel: ${battlePass.current_level}`);
        console.log(`   Ahorros del mes: $${battlePass.total_savings}`);
        console.log(`   Puntos: ${battlePass.total_points}`);
        console.log(`   Racha: ${battlePass.streak_days} días`);
      }

      // Solicitudes al pozo
      const poolRequests = await PoolRequest.findAll({
        where: { requester_id: user.id }
      });

      if (poolRequests.length > 0) {
        console.log(`\n🤝 SOLICITUDES AL POZO (${poolRequests.length}):`);
        for (const req of poolRequests) {
          const contributions = await PoolContribution.sum('amount', {
            where: { request_id: req.id }
          }) || 0;
          const statusIcon = req.status === 'completed' ? '✅' : '⏳';
          console.log(`   ${statusIcon} $${req.amount} - ${req.description}`);
          console.log(`      Recaudado: $${contributions.toFixed(2)}/$${req.amount}`);
        }
      }

      // Contribuciones hechas
      const contributions = await PoolContribution.findAll({
        where: { contributor_id: user.id }
      });

      if (contributions.length > 0) {
        const totalContributed = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
        console.log(`\n💝 CONTRIBUCIONES REALIZADAS: ${contributions.length} ($${totalContributed.toFixed(2)} total)`);
      }

      // Categorías de gastos
      const categories = await ExpenseCategory.count({ where: { user_id: user.id } });
      console.log(`\n📁 CATEGORÍAS DE GASTOS HORMIGA: ${categories}`);

      // Transacciones mockup
      const transactions = await Transaction.count({ where: { user_id: user.id } });
      console.log(`📈 TRANSACCIONES MOCKUP: ${transactions}`);

      console.log('\n');
    }

    // Resumen global
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN GLOBAL');
    console.log('═══════════════════════════════════════════════════════════\n');

    const stats = {
      users: await User.count(),
      goals: await Goal.count(),
      kambios: await Kambio.count(),
      poolRequests: await PoolRequest.count(),
      contributions: await PoolContribution.count(),
      categories: await ExpenseCategory.count(),
      battlePasses: await BattlePass.count(),
      transactions: await Transaction.count()
    };

    console.log(`👥 Usuarios: ${stats.users}`);
    console.log(`🎯 Metas totales: ${stats.goals}`);
    console.log(`💰 Kambios registrados: ${stats.kambios}`);
    console.log(`🤝 Solicitudes al pozo: ${stats.poolRequests}`);
    console.log(`💝 Contribuciones: ${stats.contributions}`);
    console.log(`📁 Categorías: ${stats.categories}`);
    console.log(`🏆 Battle Passes: ${stats.battlePasses}`);
    console.log(`📈 Transacciones: ${stats.transactions}`);

    console.log('\n✨ ¡La app está completamente poblada y lista para demo!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyDemoData();

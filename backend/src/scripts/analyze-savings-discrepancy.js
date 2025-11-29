const { Goal, Kambio, User } = require('../models');
const { sequelize } = require('../config/database');

async function checkDiscrepancy() {
  try {
    // Buscar tu usuario (usar el email de Julian que aparece en el screenshot)
    const user = await User.findOne({ where: { email: 'julianleon@usfq.edu.ec' } });

    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('📊 Análisis de ahorros para:', user.full_name);
    console.log('');

    // Obtener todas las metas
    const allGoals = await Goal.findAll({
      where: { user_id: user.id },
      include: [{ model: Kambio, as: 'kambios' }]
    });

    // Obtener todos los Kambios
    const allKambios = await Kambio.findAll({
      where: { user_id: user.id }
    });

    console.log('🎯 METAS:');
    let totalInActiveGoals = 0;
    let totalInAllGoals = 0;

    allGoals.forEach(goal => {
      const amount = parseFloat(goal.current_amount || 0);
      totalInAllGoals += amount;

      if (goal.status === 'active') {
        totalInActiveGoals += amount;
      }

      console.log(`  [${goal.status}] ${goal.name}: $${amount.toFixed(2)} (target: $${goal.target_amount})`);
      console.log(`    - Kambios en esta meta: ${goal.kambios.length}`);
    });

    console.log('');
    console.log('💰 KAMBIOS:');
    console.log(`  Total de Kambios registrados: ${allKambios.length}`);

    const totalKambios = allKambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
    console.log(`  Suma de todos los Kambios: $${totalKambios.toFixed(2)}`);

    console.log('');
    console.log('📈 RESUMEN:');
    console.log(`  Total en TODAS las metas: $${totalInAllGoals.toFixed(2)}`);
    console.log(`  Total en metas ACTIVAS: $${totalInActiveGoals.toFixed(2)}`);
    console.log(`  Total de Kambios: $${totalKambios.toFixed(2)}`);
    console.log(`  Diferencia: $${(totalInAllGoals - totalKambios).toFixed(2)}`);

    if (Math.abs(totalInAllGoals - totalKambios) > 0.01) {
      console.log('');
      console.log('⚠️  HAY UNA DISCREPANCIA entre el total en metas y el total de Kambios');
      console.log('   Esto puede deberse a:');
      console.log('   - Contribuciones al pozo compartido');
      console.log('   - Retiros de metas');
      console.log('   - Datos iniciales');
      console.log('   - Inconsistencia en la base de datos');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDiscrepancy();

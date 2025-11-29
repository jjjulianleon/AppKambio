const { Goal, Kambio } = require('../models');
const { sequelize } = require('../config/database');

async function fixGoalsAmounts() {
  try {
    console.log('🔧 Recalculando montos de todas las metas...\n');

    // Obtener todas las metas
    const allGoals = await Goal.findAll({
      include: [{ model: Kambio, as: 'kambios' }]
    });

    console.log(`📊 Encontradas ${allGoals.length} metas\n`);

    let updated = 0;
    let unchanged = 0;

    for (const goal of allGoals) {
      // Calcular el monto correcto basado en los Kambios
      const correctAmount = goal.kambios.reduce((sum, kambio) => {
        return sum + parseFloat(kambio.amount);
      }, 0);

      const currentAmount = parseFloat(goal.current_amount || 0);
      const difference = correctAmount - currentAmount;

      console.log(`🎯 ${goal.name} [${goal.status}]`);
      console.log(`   Kambios: ${goal.kambios.length}`);
      console.log(`   Monto actual en BD: $${currentAmount.toFixed(2)}`);
      console.log(`   Monto correcto (suma de Kambios): $${correctAmount.toFixed(2)}`);

      if (Math.abs(difference) > 0.01) {
        console.log(`   ⚠️  Diferencia: $${difference.toFixed(2)} - ACTUALIZANDO...`);

        // Actualizar el monto
        goal.current_amount = correctAmount;
        await goal.save();
        updated++;
      } else {
        console.log(`   ✅ Correcto - sin cambios`);
        unchanged++;
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RESUMEN:');
    console.log(`   Metas actualizadas: ${updated}`);
    console.log(`   Metas sin cambios: ${unchanged}`);
    console.log(`   Total procesadas: ${allGoals.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Proceso completado exitosamente\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixGoalsAmounts();

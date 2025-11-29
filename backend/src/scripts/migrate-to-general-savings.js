const { User, Goal, Kambio, UserSavings, sequelize } = require('../models');

/**
 * Script para migrar datos existentes al nuevo sistema de ahorro general
 *
 * Lógica:
 * 1. Para cada usuario, agrupa sus Kambios por mes/año
 * 2. Crea registros en user_savings con el total de cada mes
 * 3. Elimina la asociación goal_id de los Kambios (ahora van al pool general)
 * 4. Resetea current_amount de todas las metas a 0 (el progreso ahora viene del pool)
 */

async function migrateData() {
  const transaction = await sequelize.transaction();

  try {
    console.log('🔄 Starting data migration to general savings system...\n');

    // 1. Get all users
    const users = await User.findAll();
    console.log(`Found ${users.length} users to migrate\n`);

    for (const user of users) {
      console.log(`\n📊 Migrating user: ${user.full_name} (${user.email})`);

      // 2. Get all kambios for this user
      const kambios = await Kambio.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'ASC']]
      });

      if (kambios.length === 0) {
        console.log(`  No kambios found for ${user.full_name}`);
        continue;
      }

      // 3. Group kambios by month/year
      const monthlyTotals = {};

      kambios.forEach(kambio => {
        const date = new Date(kambio.created_at);
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const key = `${year}-${month}`;

        if (!monthlyTotals[key]) {
          monthlyTotals[key] = {
            month,
            year,
            total: 0,
            count: 0
          };
        }

        monthlyTotals[key].total += parseFloat(kambio.amount);
        monthlyTotals[key].count++;
      });

      // 4. Create UserSavings records for each month
      console.log(`  Creating ${Object.keys(monthlyTotals).length} UserSavings records...`);

      for (const [key, data] of Object.entries(monthlyTotals)) {
        await UserSavings.findOrCreate({
          where: {
            user_id: user.id,
            month: data.month,
            year: data.year
          },
          defaults: {
            user_id: user.id,
            month: data.month,
            year: data.year,
            total_saved: data.total
          },
          transaction
        });

        console.log(`    ✓ ${data.year}-${String(data.month).padStart(2, '0')}: $${data.total.toFixed(2)} (${data.count} kambios)`);
      }

      // 5. Remove goal_id from all kambios (make them general savings)
      console.log(`  Updating ${kambios.length} kambios to general savings...`);
      await Kambio.update(
        { goal_id: null },
        {
          where: { user_id: user.id },
          transaction
        }
      );

      // 6. Reset all goals current_amount to 0
      const goals = await Goal.findAll({
        where: { user_id: user.id }
      });

      if (goals.length > 0) {
        console.log(`  Resetting ${goals.length} goals to use general savings pool...`);
        await Goal.update(
          { current_amount: 0 },
          {
            where: { user_id: user.id },
            transaction
          }
        );
      }

      console.log(`  ✅ ${user.full_name} migration complete!`);
    }

    await transaction.commit();
    console.log('\n✅ All data migrated successfully!\n');
    console.log('📋 Summary:');
    console.log('  - All Kambios now contribute to general savings pool');
    console.log('  - Goals now display progress based on UserSavings total');
    console.log('  - Users can complete any goal when total_saved >= target_amount\n');

  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrateData();

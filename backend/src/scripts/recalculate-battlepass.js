const { BattlePass, Kambio, User } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Recalculate battle pass for all users based on current month's Kambios
 */
async function recalculateBattlePass() {
  try {
    console.log('🔄 Recalculating Battle Pass for all users...\n');

    // Get current month key
    const currentDate = new Date();
    const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7) + '-01';
    console.log(`📅 Current month: ${monthKey}\n`);

    // Get all users
    const users = await User.findAll();
    console.log(`👥 Found ${users.length} users\n`);

    // Level thresholds
    const levels = [
      { level: 7, min: 300 },
      { level: 6, min: 200 },
      { level: 5, min: 150 },
      { level: 4, min: 100 },
      { level: 3, min: 75 },
      { level: 2, min: 50 },
      { level: 1, min: 25 },
      { level: 0, min: 0 }
    ];

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.name} (${user.email})`);

      // Get all Kambios for this user in the current month
      const startOfMonth = new Date(monthKey);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const kambios = await Kambio.findAll({
        where: {
          user_id: user.id,
          created_at: {
            [sequelize.Sequelize.Op.gte]: startOfMonth,
            [sequelize.Sequelize.Op.lt]: endOfMonth
          }
        }
      });

      const totalSavings = kambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
      console.log(`   💰 Total Kambios this month: ${kambios.length}`);
      console.log(`   💵 Total savings: $${totalSavings.toFixed(2)}`);

      // Calculate level
      let currentLevel = 0;
      for (const levelInfo of levels) {
        if (totalSavings >= levelInfo.min) {
          currentLevel = levelInfo.level;
          break;
        }
      }

      console.log(`   🏆 Calculated level: ${currentLevel}`);

      // Get or create battle pass
      let battlePass = await BattlePass.findOne({
        where: {
          user_id: user.id,
          month: monthKey
        }
      });

      if (!battlePass) {
        console.log('   ✨ Creating new Battle Pass...');
        battlePass = await BattlePass.create({
          user_id: user.id,
          month: monthKey,
          total_savings: totalSavings,
          current_level: currentLevel,
          total_points: 0,
          completed_challenges: [],
          streak_days: 0
        });
        console.log('   ✅ Battle Pass created!');
      } else {
        const oldSavings = parseFloat(battlePass.total_savings);
        const oldLevel = battlePass.current_level;

        console.log(`   📊 Old values - Savings: $${oldSavings.toFixed(2)}, Level: ${oldLevel}`);

        battlePass.total_savings = totalSavings;
        battlePass.current_level = currentLevel;
        await battlePass.save();

        console.log(`   📊 New values - Savings: $${totalSavings.toFixed(2)}, Level: ${currentLevel}`);
        console.log('   ✅ Battle Pass updated!');
      }
    }

    console.log('\n✅ Battle Pass recalculation completed!\n');
  } catch (error) {
    console.error('❌ Error recalculating battle pass:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  recalculateBattlePass();
}

module.exports = { recalculateBattlePass };

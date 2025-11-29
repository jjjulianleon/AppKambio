const { sequelize, UserSavings, Kambio, User } = require('../models');

async function checkUserSavings() {
  try {
    console.log('🔍 Checking user savings data...\n');

    // Get all users
    const users = await User.findAll();
    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.full_name} (${user.email})`);

      // Get user savings
      const savings = await UserSavings.findAll({
        where: { user_id: user.id },
        order: [['year', 'DESC'], ['month', 'DESC']]
      });

      if (savings.length > 0) {
        console.log('  💰 Savings records:');
        savings.forEach(s => {
          console.log(`    - ${s.year}-${String(s.month).padStart(2, '0')}: $${s.total_saved}`);
        });
      } else {
        console.log('  ⚠️  No savings records found');
      }

      // Get kambios count
      const kambiosCount = await Kambio.count({
        where: { user_id: user.id }
      });
      console.log(`  📊 Kambios: ${kambiosCount}`);

      // Get kambios with transaction_type = 'save'
      const saveKambios = await Kambio.findAll({
        where: {
          user_id: user.id,
          transaction_type: 'save'
        },
        attributes: ['amount', 'created_at']
      });

      if (saveKambios.length > 0) {
        const totalSaveAmount = saveKambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
        console.log(`  💵 Total saved via kambios (type='save'): $${totalSaveAmount.toFixed(2)}`);
      }
    }

    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkUserSavings();

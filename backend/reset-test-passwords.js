require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function resetTestPasswords() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    // Define test passwords
    const testPassword = 'test123'; // Simple password for debugging
    const hashedPassword = await User.hashPassword(testPassword);

    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name']
    });

    console.log('🔄 Resetting passwords to "test123" for all users...\n');

    for (const user of users) {
      await user.update({ password_hash: hashedPassword });
      console.log(`✓ Updated password for: ${user.full_name} (${user.email})`);
    }

    console.log('\n✅ All passwords have been reset!\n');
    console.log('📋 You can now login with:');
    console.log('==================\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Password: test123`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetTestPasswords();

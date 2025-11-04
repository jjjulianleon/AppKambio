require('dotenv').config();
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');

    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'created_at'],
      order: [['created_at', 'ASC']]
    });

    console.log(`📊 Total users: ${users.length}\n`);
    console.log('Users in database:');
    console.log('==================\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString('es-ES')}`);
      console.log('');
    });

    console.log('\n💡 Note: Para debugging, las contraseñas están hasheadas en la base de datos.');
    console.log('   Si no recuerdas la contraseña de un usuario, usa la función "Olvidé mi contraseña"');
    console.log('   para resetearla desde la app.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listUsers();

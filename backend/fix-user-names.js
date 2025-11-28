const { User } = require('./src/models');

const fixUserNames = async () => {
  try {
    console.log('📋 Usuarios actuales:\n');

    const users = await User.findAll();
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Nombre actual: "${user.full_name}"`);
      console.log(`Email: ${user.email}`);
      console.log('---');
    });

    console.log('\n🔄 Actualizando nombres...\n');

    // Mapeo de nombres correctos
    const nameUpdates = {
      'Julianleon': 'Julian Leon',
      'Stevenparedes': 'Steven Paredes',
      'Estuardoparedes': 'Estuardo Paredes',
      'Alexisvaca': 'Alexis Vaca'
    };

    for (const user of users) {
      const currentName = user.full_name;
      const newName = nameUpdates[currentName];

      if (newName) {
        await user.update({ full_name: newName });
        console.log(`✅ Actualizado: "${currentName}" → "${newName}"`);
      } else {
        console.log(`⏭️  Sin cambios: "${currentName}"`);
      }
    }

    console.log('\n✅ Nombres actualizados correctamente!\n');
    console.log('📋 Usuarios después de actualizar:\n');

    const updatedUsers = await User.findAll();
    updatedUsers.forEach(user => {
      console.log(`✓ ${user.full_name} (${user.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixUserNames();

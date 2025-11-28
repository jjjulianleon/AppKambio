const { sequelize } = require('./src/config/database');
const { User, Transaction } = require('./src/models');
const aiService = require('./src/services/aiService');

/**
 * Script para generar transacciones mockup usando OpenAI
 *
 * Cómo funciona:
 * 1. Lee todos los usuarios de la base de datos
 * 2. Para cada usuario, llama a OpenAI para generar transacciones realistas
 * 3. OpenAI genera "gastos hormiga" típicos de jóvenes ecuatorianos
 * 4. Las transacciones incluyen: descripción, monto, categoría, fecha con hora
 * 5. Se guardan en la tabla 'transactions' para que el Insights AI pueda analizarlas
 */

async function generateMockData() {
  console.log('🤖 Generador de Transacciones Mockup con AI\n');
  console.log('Este script usa OpenAI para generar transacciones realistas.');
  console.log('Cada usuario recibirá ~20 transacciones con patrones de tiempo.\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Conectado a la base de datos\n');

    // Obtener todos los usuarios
    const users = await User.findAll();

    if (users.length === 0) {
      console.error('❌ No hay usuarios en la base de datos.');
      console.log('💡 Primero crea usuarios usando el register endpoint.');
      process.exit(1);
    }

    console.log(`👥 Usuarios encontrados: ${users.length}\n`);

    // Preguntar cuántas transacciones generar por usuario
    const transactionsPerUser = 20; // Puedes cambiar este número

    for (const user of users) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 Usuario: ${user.full_name} (${user.email})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Generar transacciones usando OpenAI
      console.log(`🧠 Generando ${transactionsPerUser} transacciones con OpenAI...`);

      try {
        const mockTransactions = await aiService.generateMockTransactions(transactionsPerUser);
        console.log(`✓ OpenAI generó ${mockTransactions.length} transacciones\n`);

        // Mostrar preview de las primeras 3
        console.log('📋 Preview de transacciones generadas:');
        mockTransactions.slice(0, 3).forEach((t, i) => {
          console.log(`   ${i + 1}. ${t.description}`);
          console.log(`      💰 $${t.amount} | 📁 ${t.category} | 📅 ${new Date(t.date).toLocaleString()}`);
        });
        console.log(`   ... y ${mockTransactions.length - 3} más\n`);

        // Guardar en la base de datos
        console.log('💾 Guardando en la base de datos...');
        let savedCount = 0;

        for (const t of mockTransactions) {
          try {
            await Transaction.create({
              user_id: user.id,
              amount: parseFloat(t.amount),
              description: t.description,
              category: t.category,
              transaction_date: new Date(t.date)
            });
            savedCount++;
          } catch (error) {
            console.error(`   ⚠️  Error guardando transacción: ${error.message}`);
          }
        }

        console.log(`✅ Guardadas ${savedCount}/${mockTransactions.length} transacciones para ${user.full_name}\n`);

      } catch (aiError) {
        console.error(`❌ Error con OpenAI para ${user.email}:`, aiError.message);
        console.log('⏭️  Continuando con siguiente usuario...\n');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Proceso completado!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Resumen final
    const totalTransactions = await Transaction.count();
    console.log(`📊 Total de transacciones en la base de datos: ${totalTransactions}`);
    console.log(`\n💡 Ahora puedes probar el Insights AI en la app móvil!`);
    console.log(`   Settings → Insights AI → Generar Consejo\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
generateMockData();

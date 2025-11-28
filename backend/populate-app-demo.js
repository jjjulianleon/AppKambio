const {
  User,
  Goal,
  Kambio,
  ExpenseCategory,
  SavingsPool,
  PoolRequest,
  PoolContribution,
  BattlePass,
  FinancialProfile
} = require('./src/models');

/**
 * 🎯 Script para poblar TODA la aplicación con data realista
 *
 * Perfiles de usuarios:
 * - Julian Leon: Estudiante, metas pequeñas (consola, auriculares)
 * - Steven Paredes: Enfocado en ropa y estilo
 * - Estuardo Paredes: Gamer, quiere PC y juegos
 * - Alexis Vaca: Fitness y salud
 */

const userProfiles = {
  'julianleon@usfq.edu.ec': {
    name: 'Julian Leon',
    personality: 'student',
    interests: ['gaming', 'tech'],
    goals: [
      { name: 'Nintendo Switch', amount: 350, imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', category: 'Gaming' },
      { name: 'AirPods Pro', amount: 250, imageUrl: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', category: 'Tech' },
      { name: 'Salida con amigos', amount: 80, imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400', category: 'Social' }
    ],
    expenseCategories: [
      { name: 'Cafés', emoji: '☕', amount: 3.50 },
      { name: 'Snacks', emoji: '🍿', amount: 2.50 },
      { name: 'Uber', emoji: '🚕', amount: 4.00 }
    ],
    poolRequest: { amount: 100, reason: 'Reparar laptop para estudios' }
  },
  'stevenparedes@usfq.edu.ec': {
    name: 'Steven Paredes',
    personality: 'fashionable',
    interests: ['fashion', 'lifestyle'],
    goals: [
      { name: 'Zapatillas Nike', amount: 180, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Ropa' },
      { name: 'Chaqueta de cuero', amount: 280, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', category: 'Ropa' },
      { name: 'Reloj inteligente', amount: 350, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Tech' },
      { name: 'Viaje a Montañita', amount: 450, imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', category: 'Viajes' }
    ],
    expenseCategories: [
      { name: 'Cafés premium', emoji: '☕', amount: 5.00 },
      { name: 'Almuerzo', emoji: '🍽️', amount: 8.00 },
      { name: 'Uber', emoji: '🚕', amount: 5.00 }
    ],
    poolRequest: { amount: 150, reason: 'Comprar outfit para entrevista de trabajo' }
  },
  'estuardoparedes@usfq.edu.ec': {
    name: 'Estuardo Paredes',
    personality: 'gamer',
    interests: ['gaming', 'tech', 'esports'],
    goals: [
      { name: 'PC Gamer RTX 4060', amount: 1200, imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400', category: 'Gaming' },
      { name: 'Monitor 144Hz', amount: 350, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', category: 'Gaming' },
      { name: 'Silla Gamer', amount: 280, imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400', category: 'Gaming' },
      { name: 'PlayStation 5', amount: 550, imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400', category: 'Gaming' }
    ],
    expenseCategories: [
      { name: 'Juegos Steam', emoji: '🎮', amount: 15.00 },
      { name: 'Snacks gaming', emoji: '🍕', amount: 6.00 },
      { name: 'Energy drinks', emoji: '⚡', amount: 3.00 }
    ],
    poolRequest: { amount: 200, reason: 'Arreglar mi PC que se dañó' }
  },
  'alexisvaca@usfq.edu.ec': {
    name: 'Alexis Vaca',
    personality: 'fitness',
    interests: ['health', 'fitness', 'wellness'],
    goals: [
      { name: 'Membresía gym anual', amount: 400, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', category: 'Fitness' },
      { name: 'Suplementos proteína', amount: 120, imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', category: 'Salud' },
      { name: 'Zapatillas running', amount: 150, imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', category: 'Deportes' },
      { name: 'Smartwatch deportivo', amount: 280, imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400', category: 'Tech' }
    ],
    expenseCategories: [
      { name: 'Batidos proteína', emoji: '🥤', amount: 4.50 },
      { name: 'Comida saludable', emoji: '🥗', amount: 7.00 },
      { name: 'Uber al gym', emoji: '🚕', amount: 3.50 }
    ],
    poolRequest: { amount: 120, reason: 'Comprar equipo de crossfit' }
  }
};

async function populateApp() {
  console.log('🎯 POBLANDO LA APLICACIÓN KAMBIO PARA DEMO\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Obtener usuarios
    const users = await User.findAll();
    const userMap = {};
    users.forEach(u => userMap[u.email] = u);

    // 2. Obtener el pool
    const pool = await SavingsPool.findOne({ where: { is_active: true } });

    if (!pool) {
      console.error('❌ No se encontró el pozo de ahorro');
      process.exit(1);
    }

    console.log(`💰 Pozo de ahorro encontrado: ${pool.name}\n`);

    // 3. Poblar para cada usuario
    for (const [email, profile] of Object.entries(userProfiles)) {
      const user = userMap[email];
      if (!user) {
        console.log(`⚠️  Usuario ${email} no encontrado, saltando...\n`);
        continue;
      }

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 ${profile.name.toUpperCase()}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // 3.1 Crear perfil financiero
      await FinancialProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          savings_barrier: profile.personality === 'student' ? 'falta_disciplina' : 'gastos_imprevistos',
          motivation: profile.personality === 'gamer' ? 'comprar_algo_especifico' : 'emergencias',
          spending_personality: profile.personality === 'fitness' ? 'planificador' : 'impulsivo'
        }
      });
      console.log('✅ Perfil financiero creado');

      // 3.2 Crear categorías de gastos
      console.log(`\n📁 Creando categorías de gastos hormiga...`);
      for (const cat of profile.expenseCategories) {
        await ExpenseCategory.findOrCreate({
          where: {
            user_id: user.id,
            category_name: cat.name
          },
          defaults: {
            user_id: user.id,
            category_name: cat.name,
            emoji: cat.emoji,
            default_amount: cat.amount
          }
        });
      }
      console.log(`   ✓ ${profile.expenseCategories.length} categorías creadas`);

      // 3.3 Crear metas
      console.log(`\n🎯 Creando metas personalizadas...`);
      const createdGoals = [];

      for (let i = 0; i < profile.goals.length; i++) {
        const goalData = profile.goals[i];
        const isFirst = i === 0;
        const isCompleted = i === profile.goals.length - 1; // Última meta completada

        // Calcular progreso
        let currentAmount = 0;
        let status = 'active';

        if (isCompleted) {
          currentAmount = goalData.amount;
          status = 'completed';
        } else if (isFirst) {
          // Primera meta: 60-80% completada
          currentAmount = goalData.amount * (0.6 + Math.random() * 0.2);
        } else {
          // Otras metas: 20-50% completadas
          currentAmount = goalData.amount * (0.2 + Math.random() * 0.3);
        }

        const goal = await Goal.create({
          user_id: user.id,
          name: goalData.name,
          target_amount: goalData.amount,
          current_amount: parseFloat(currentAmount.toFixed(2)),
          image_url: goalData.imageUrl,
          status: status,
          completed_at: status === 'completed' ? new Date() : null
        });

        createdGoals.push({ goal, category: goalData.category });

        const progress = Math.round((currentAmount / goalData.amount) * 100);
        console.log(`   ${status === 'completed' ? '🏆' : '📊'} ${goalData.name}: $${currentAmount.toFixed(2)}/$${goalData.amount} (${progress}%)`);
      }

      // 3.4 Crear Kambios (ahorros) para cada meta
      console.log(`\n💰 Generando historial de Kambios...`);
      let totalKambios = 0;
      let totalSaved = 0;

      for (const { goal, category } of createdGoals) {
        const numKambios = goal.status === 'completed' ?
          Math.floor(Math.random() * 5) + 8 : // 8-12 kambios para completadas
          Math.floor(Math.random() * 4) + 3;  // 3-6 kambios para activas

        let savedForGoal = 0;

        for (let i = 0; i < numKambios; i++) {
          // Montos entre 5 y 25
          const amount = 5 + Math.random() * 20;

          // Fechas en los últimos 30 días
          const daysAgo = Math.floor(Math.random() * 30);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          // Evitar exceder el monto de la meta
          if (savedForGoal + amount > goal.current_amount) {
            break;
          }

          await Kambio.create({
            user_id: user.id,
            goal_id: goal.id,
            amount: parseFloat(amount.toFixed(2)),
            description: `Evité gasto en ${profile.expenseCategories[Math.floor(Math.random() * profile.expenseCategories.length)].name}`,
            created_at: createdAt,
            updated_at: createdAt
          });

          savedForGoal += amount;
          totalKambios++;
          totalSaved += amount;
        }
      }
      console.log(`   ✓ ${totalKambios} Kambios creados ($${totalSaved.toFixed(2)} total ahorrado)`);

      // 3.5 Crear Battle Pass del mes actual
      console.log(`\n🏆 Configurando Battle Pass...`);
      const monthKey = new Date().toISOString().split('T')[0].slice(0, 7) + '-01';

      const totalSavingsMonth = totalSaved * 0.7; // 70% del total para este mes
      let battlePassLevel = 0;

      if (totalSavingsMonth >= 300) battlePassLevel = 7;
      else if (totalSavingsMonth >= 200) battlePassLevel = 6;
      else if (totalSavingsMonth >= 150) battlePassLevel = 5;
      else if (totalSavingsMonth >= 100) battlePassLevel = 4;
      else if (totalSavingsMonth >= 75) battlePassLevel = 3;
      else if (totalSavingsMonth >= 50) battlePassLevel = 2;
      else if (totalSavingsMonth >= 25) battlePassLevel = 1;

      await BattlePass.findOrCreate({
        where: {
          user_id: user.id,
          month: monthKey
        },
        defaults: {
          user_id: user.id,
          month: monthKey,
          total_savings: parseFloat(totalSavingsMonth.toFixed(2)),
          current_level: battlePassLevel,
          total_points: battlePassLevel * 100,
          streak_days: Math.floor(Math.random() * 10) + 5,
          completed_challenges: []
        }
      });
      console.log(`   ✓ Battle Pass Nivel ${battlePassLevel} ($${totalSavingsMonth.toFixed(2)} ahorrados este mes)`);

      // 3.6 Crear solicitud al pozo
      console.log(`\n🤝 Creando solicitud al Pozo de Ahorro...`);

      const requestStatus = Math.random() > 0.5 ? 'active' : 'completed';
      const requestAmount = profile.poolRequest.amount;
      const contributedAmount = requestStatus === 'completed' ? requestAmount : requestAmount * (0.3 + Math.random() * 0.4);

      const poolRequestCreated = await PoolRequest.create({
        pool_id: pool.id,
        requester_id: user.id,
        amount: requestAmount,
        description: profile.poolRequest.reason,
        status: requestStatus,
        completed_at: requestStatus === 'completed' ? new Date() : null
      });

      console.log(`   ${requestStatus === 'completed' ? '✅' : '⏳'} Solicitud: $${requestAmount} - "${profile.poolRequest.reason}"`);
      console.log(`      Estado: ${requestStatus === 'completed' ? 'Completada' : 'Activa'}`);
      console.log(`      Recaudado: $${contributedAmount.toFixed(2)}/$${requestAmount}`);

      // 3.7 Crear contribuciones de otros usuarios al pozo de este usuario
      if (contributedAmount > 0) {
        console.log(`\n💝 Generando contribuciones al pozo...`);
        const otherUsers = users.filter(u => u.id !== user.id);
        const numContributors = Math.min(otherUsers.length, Math.floor(Math.random() * 3) + 1);

        let totalContributed = 0;
        const contributors = otherUsers.sort(() => Math.random() - 0.5).slice(0, numContributors);

        for (const contributor of contributors) {
          const contribution = contributedAmount / numContributors;

          if (totalContributed + contribution > contributedAmount) {
            break;
          }

          await PoolContribution.create({
            request_id: poolRequestCreated.id,
            contributor_id: contributor.id,
            amount: parseFloat(contribution.toFixed(2))
          });

          console.log(`      💸 ${userProfiles[contributor.email]?.name || contributor.full_name} contribuyó $${contribution.toFixed(2)}`);
          totalContributed += contribution;
        }
      }

      console.log(`\n✅ ${profile.name} poblado exitosamente!\n`);
    }

    // 4. Resumen final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 POBLACIÓN DE LA APP COMPLETADA');
    console.log('═══════════════════════════════════════════════════════════\n');

    const stats = {
      goals: await Goal.count(),
      kambios: await Kambio.count(),
      poolRequests: await PoolRequest.count(),
      contributions: await PoolContribution.count(),
      battlePasses: await BattlePass.count()
    };

    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   🎯 Metas creadas: ${stats.goals}`);
    console.log(`   💰 Kambios registrados: ${stats.kambios}`);
    console.log(`   🤝 Solicitudes al pozo: ${stats.poolRequests}`);
    console.log(`   💝 Contribuciones: ${stats.contributions}`);
    console.log(`   🏆 Battle Passes: ${stats.battlePasses}`);
    console.log('');
    console.log('✨ La app está lista para la demostración!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error poblando la app:', error);
    console.error(error);
    process.exit(1);
  }
}

populateApp();

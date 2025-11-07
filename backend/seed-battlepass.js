const { sequelize } = require('./src/config/database');
const { BattlePassReward, BattlePassChallenge } = require('./src/models');

async function seedBattlePassData() {
  console.log('🌱 Seeding Battle Pass data...\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await BattlePassReward.destroy({ where: {} });
    await BattlePassChallenge.destroy({ where: {} });
    console.log('✓ Data cleared\n');

    // Create Battle Pass Rewards (7 levels)
    console.log('🎁 Creating Battle Pass rewards...');
    
    const rewards = [
      {
        level: 1,
        min_savings: 25.00,
        max_savings: 49.99,
        reward_title: 'Descuento en Cine 10%',
        reward_description: 'Obtén un 10% de descuento en entradas de cine en los principales complejos de tu ciudad. Válido por 30 días.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({
          type: 'discount',
          percentage: 10,
          category: 'cinema',
          validity_days: 30
        }),
        icon_url: '🎬',
        active: true
      },
      {
        level: 2,
        min_savings: 50.00,
        max_savings: 74.99,
        reward_title: 'Descuento en Restaurante 15%',
        reward_description: 'Disfruta un 15% de descuento en restaurantes asociados. Perfecto para celebrar tus logros de ahorro.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({
          type: 'discount',
          percentage: 15,
          category: 'restaurant',
          validity_days: 30
        }),
        icon_url: '🍔',
        active: true
      },
      {
        level: 3,
        min_savings: 75.00,
        max_savings: 99.99,
        reward_title: 'Cashback 5%',
        reward_description: 'Recibe un 5% de cashback en tu próximo ahorro. ¡Tu dinero trabaja para ti!',
        reward_category: 'POINTS',
        reward_value: JSON.stringify({
          type: 'cashback',
          percentage: 5,
          max_amount: 50
        }),
        icon_url: '💰',
        active: true
      },
      {
        level: 4,
        min_savings: 100.00,
        max_savings: 149.99,
        reward_title: 'Desbloqueo de Feature Premium',
        reward_description: 'Accede a análisis avanzados de tus patrones de ahorro y recomendaciones personalizadas por IA.',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({
          type: 'feature_unlock',
          feature: 'advanced_analytics',
          duration_days: 30
        }),
        icon_url: '🔓',
        active: true
      },
      {
        level: 5,
        min_savings: 150.00,
        max_savings: 199.99,
        reward_title: 'Descuento en Viaje 20%',
        reward_description: 'Obtén 20% de descuento en hoteles y experiencias de viaje. ¡Es hora de disfrutar tus ahorros!',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({
          type: 'discount',
          percentage: 20,
          category: 'travel',
          validity_days: 60
        }),
        icon_url: '✈️',
        active: true
      },
      {
        level: 6,
        min_savings: 200.00,
        max_savings: 299.99,
        reward_title: 'Experiencia Exclusiva',
        reward_description: 'Accede a eventos exclusivos, talleres de finanzas personales y masterclasses con expertos.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({
          type: 'experience',
          category: 'workshop',
          validity_days: 90
        }),
        icon_url: '🌟',
        active: true
      },
      {
        level: 7,
        min_savings: 300.00,
        max_savings: null,
        reward_title: 'Badge Maestro del Ahorro + Premium Gratis',
        reward_description: '¡Eres un maestro del ahorro! Recibe un badge exclusivo y 1 mes gratis de todas las funciones premium.',
        reward_category: 'BADGE',
        reward_value: JSON.stringify({
          type: 'badge',
          badge_name: 'Maestro del Ahorro',
          premium_months: 1
        }),
        icon_url: '🏆',
        active: true
      }
    ];

    for (const reward of rewards) {
      await BattlePassReward.create(reward);
      console.log(`  ✓ Nivel ${reward.level}: ${reward.reward_title}`);
    }

    console.log('\n🎯 Creating Battle Pass challenges...');

    const challenges = [
      {
        name: 'Racha de 7 días',
        description: 'Ahorra al menos una vez al día durante 7 días consecutivos',
        challenge_type: 'STREAK',
        target_value: 7,
        bonus_points: 50,
        duration_days: 7,
        icon_url: '🔥',
        active: true
      },
      {
        name: 'Ahorro semanal constante',
        description: 'Realiza al menos 3 ahorros en una semana',
        challenge_type: 'TARGET',
        target_value: 3,
        bonus_points: 30,
        duration_days: 7,
        icon_url: '⚡',
        active: true
      },
      {
        name: 'Diversifica tus metas',
        description: 'Ahorra en al menos 3 metas diferentes este mes',
        challenge_type: 'CATEGORY',
        target_value: 3,
        bonus_points: 40,
        duration_days: 30,
        icon_url: '🎯',
        active: true
      },
      {
        name: 'Meta del mes',
        description: 'Alcanza $100 en ahorros totales en un mes',
        challenge_type: 'TARGET',
        target_value: 100,
        bonus_points: 100,
        duration_days: 30,
        icon_url: '💪',
        active: true
      },
      {
        name: 'Inicio fuerte',
        description: 'Realiza tu primer ahorro del mes en los primeros 3 días',
        challenge_type: 'STREAK',
        target_value: 1,
        bonus_points: 20,
        duration_days: 3,
        icon_url: '🚀',
        active: true
      },
      {
        name: 'Colaborador del Pozo',
        description: 'Contribuye al menos 2 veces al Pozo de Ahorro este mes',
        challenge_type: 'CATEGORY',
        target_value: 2,
        bonus_points: 35,
        duration_days: 30,
        icon_url: '🤝',
        active: true
      }
    ];

    for (const challenge of challenges) {
      await BattlePassChallenge.create(challenge);
      console.log(`  ✓ ${challenge.name} (+${challenge.bonus_points} puntos)`);
    }

    console.log('\n✅ Battle Pass data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${rewards.length} rewards created (7 levels)`);
    console.log(`   - ${challenges.length} challenges created`);
    console.log('\n🎮 Battle Pass system ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Battle Pass data:', error);
    process.exit(1);
  }
}

seedBattlePassData();

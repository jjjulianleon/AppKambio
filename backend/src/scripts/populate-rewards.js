const { BattlePassReward } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Populate battle pass rewards
 */
async function populateRewards() {
  try {
    console.log('🎁 Populating Battle Pass Rewards...\n');

    // Delete existing rewards
    await BattlePassReward.destroy({ where: {} });
    console.log('🗑️  Cleared existing rewards\n');

    // Define rewards by level
    const rewards = [
      // Nivel 1: $25 - Recompensas iniciales
      {
        level: 1,
        min_savings: 25,
        reward_title: '5% de descuento en cafeterías',
        reward_description: 'Obtén 5% de descuento en cafeterías participantes. ¡Tu primer paso hacia grandes ahorros!',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 5, partners: ['Starbucks', 'Juan Valdez', 'Sweet & Coffee'] }),
        icon_url: '☕',
        active: true
      },
      {
        level: 1,
        min_savings: 25,
        reward_title: 'Badge "Ahorrista Principiante"',
        reward_description: '¡Conseguiste tu primer badge! Demuestra tu compromiso con el ahorro.',
        reward_category: 'BADGE',
        reward_value: JSON.stringify({ badge_id: 'beginner', rarity: 'common' }),
        icon_url: '🏅',
        active: true
      },

      // Nivel 2: $50 - Mejores descuentos
      {
        level: 2,
        min_savings: 50,
        reward_title: '10% OFF en comida rápida',
        reward_description: 'Disfruta 10% de descuento en McDonald\'s, KFC, Burger King y más.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 10, partners: ['McDonald\'s', 'KFC', 'Burger King', 'Subway'] }),
        icon_url: '🍔',
        active: true
      },
      {
        level: 2,
        min_savings: 50,
        reward_title: 'Envío gratis en Uber Eats',
        reward_description: 'Código para 2 envíos gratis en Uber Eats (pedidos mínimos de $10).',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({ type: 'promo_code', quantity: 2, min_order: 10 }),
        icon_url: '🚗',
        active: true
      },

      // Nivel 3: $75 - Entretenimiento
      {
        level: 3,
        min_savings: 75,
        reward_title: '2x1 en entradas de cine',
        reward_description: 'Boleto gratis comprando uno en Cinemark, Supercines y Multicines.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({ type: '2x1', partners: ['Cinemark', 'Supercines', 'Multicines'] }),
        icon_url: '🎬',
        active: true
      },
      {
        level: 3,
        min_savings: 75,
        reward_title: '15% OFF en restaurantes',
        reward_description: 'Descuento del 15% en restaurantes seleccionados de la ciudad.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 15, category: 'restaurants' }),
        icon_url: '🍽️',
        active: true
      },
      {
        level: 3,
        min_savings: 75,
        reward_title: 'Badge "Ahorrista Constante"',
        reward_description: 'Badge plateado que demuestra tu dedicación al ahorro.',
        reward_category: 'BADGE',
        reward_value: JSON.stringify({ badge_id: 'consistent', rarity: 'silver' }),
        icon_url: '🥈',
        active: true
      },

      // Nivel 4: $100 - Mejores beneficios
      {
        level: 4,
        min_savings: 100,
        reward_title: 'Mes gratis de Spotify Premium',
        reward_description: 'Disfruta 1 mes de Spotify Premium completamente gratis.',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({ type: 'subscription', service: 'Spotify Premium', duration: '1 month' }),
        icon_url: '🎵',
        active: true
      },
      {
        level: 4,
        min_savings: 100,
        reward_title: '20% OFF en tiendas de ropa',
        reward_description: 'Descuento del 20% en Zara, H&M, Forever 21 y tiendas participantes.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 20, partners: ['Zara', 'H&M', 'Forever 21'] }),
        icon_url: '👕',
        active: true
      },
      {
        level: 4,
        min_savings: 100,
        reward_title: 'Clase gratis de Yoga/Gym',
        reward_description: 'Una clase gratis en gimnasios y estudios de yoga participantes.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({ type: 'free_class', category: 'fitness' }),
        icon_url: '🧘',
        active: true
      },

      // Nivel 5: $150 - Premios mayores
      {
        level: 5,
        min_savings: 150,
        reward_title: '$10 de cashback',
        reward_description: 'Recibe $10 de cashback para usar en tu próximo Kambio.',
        reward_category: 'POINTS',
        reward_value: JSON.stringify({ type: 'cashback', amount: 10, currency: 'USD' }),
        icon_url: '💵',
        active: true
      },
      {
        level: 5,
        min_savings: 150,
        reward_title: '2x1 en experiencias gastronómicas',
        reward_description: 'Segunda persona gratis en restaurantes premium seleccionados.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({ type: '2x1', category: 'premium_dining' }),
        icon_url: '🍷',
        active: true
      },
      {
        level: 5,
        min_savings: 150,
        reward_title: 'Badge "Ahorrista Experto"',
        reward_description: 'Badge dorado exclusivo para ahorradores dedicados.',
        reward_category: 'BADGE',
        reward_value: JSON.stringify({ badge_id: 'expert', rarity: 'gold' }),
        icon_url: '🥇',
        active: true
      },
      {
        level: 5,
        min_savings: 150,
        reward_title: '25% OFF en servicios de belleza',
        reward_description: 'Descuento del 25% en salones de belleza y spas participantes.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 25, category: 'beauty' }),
        icon_url: '💅',
        active: true
      },

      // Nivel 6: $200 - Beneficios premium
      {
        level: 6,
        min_savings: 200,
        reward_title: 'Mes gratis de Netflix Estándar',
        reward_description: 'Disfruta 1 mes de Netflix plan Estándar completamente gratis.',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({ type: 'subscription', service: 'Netflix Standard', duration: '1 month' }),
        icon_url: '📺',
        active: true
      },
      {
        level: 6,
        min_savings: 200,
        reward_title: '$20 de cashback',
        reward_description: 'Recibe $20 de cashback para usar en tus metas de ahorro.',
        reward_category: 'POINTS',
        reward_value: JSON.stringify({ type: 'cashback', amount: 20, currency: 'USD' }),
        icon_url: '💰',
        active: true
      },
      {
        level: 6,
        min_savings: 200,
        reward_title: '30% OFF en tecnología',
        reward_description: 'Descuento del 30% en accesorios tecnológicos en tiendas seleccionadas.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 30, category: 'tech' }),
        icon_url: '💻',
        active: true
      },
      {
        level: 6,
        min_savings: 200,
        reward_title: 'Entrada gratis a eventos',
        reward_description: 'Entrada gratis a conciertos, obras de teatro o eventos culturales seleccionados.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({ type: 'free_entry', category: 'cultural_events' }),
        icon_url: '🎭',
        active: true
      },

      // Nivel 7: $300+ - Recompensas máximas
      {
        level: 7,
        min_savings: 300,
        reward_title: '¡$50 de cashback MEGA!',
        reward_description: 'Recibe $50 de cashback para impulsar tus metas de ahorro.',
        reward_category: 'POINTS',
        reward_value: JSON.stringify({ type: 'cashback', amount: 50, currency: 'USD', special: 'mega' }),
        icon_url: '💎',
        active: true
      },
      {
        level: 7,
        min_savings: 300,
        reward_title: 'Cena para 2 en restaurante premium',
        reward_description: 'Cena completa para 2 personas en restaurantes de alta categoría.',
        reward_category: 'EXPERIENCE',
        reward_value: JSON.stringify({ type: 'free_meal', people: 2, category: 'premium' }),
        icon_url: '🥂',
        active: true
      },
      {
        level: 7,
        min_savings: 300,
        reward_title: 'Badge "Maestro del Ahorro"',
        reward_description: 'Badge de diamante exclusivo. ¡Eres un verdadero maestro del ahorro!',
        reward_category: 'BADGE',
        reward_value: JSON.stringify({ badge_id: 'master', rarity: 'diamond' }),
        icon_url: '💠',
        active: true
      },
      {
        level: 7,
        min_savings: 300,
        reward_title: '3 meses de Amazon Prime',
        reward_description: 'Disfruta 3 meses de Amazon Prime con envíos gratis y Prime Video.',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({ type: 'subscription', service: 'Amazon Prime', duration: '3 months' }),
        icon_url: '📦',
        active: true
      },
      {
        level: 7,
        min_savings: 300,
        reward_title: '40% OFF en viajes',
        reward_description: 'Descuento del 40% en paquetes turísticos y hospedaje en hoteles seleccionados.',
        reward_category: 'DISCOUNT',
        reward_value: JSON.stringify({ type: 'percentage', value: 40, category: 'travel' }),
        icon_url: '✈️',
        active: true
      },
      {
        level: 7,
        min_savings: 300,
        reward_title: 'Acceso VIP a eventos exclusivos',
        reward_description: 'Acceso prioritario y beneficios VIP en eventos de Kambio.',
        reward_category: 'UNLOCK',
        reward_value: JSON.stringify({ type: 'vip_access', category: 'kambio_events' }),
        icon_url: '⭐',
        active: true
      }
    ];

    // Create all rewards
    console.log('📝 Creating rewards...\n');
    for (const reward of rewards) {
      await BattlePassReward.create(reward);
      console.log(`✅ Nivel ${reward.level}: ${reward.reward_title}`);
    }

    console.log(`\n🎉 Successfully created ${rewards.length} rewards!\n`);

    // Show summary by level
    console.log('📊 Summary by level:\n');
    for (let level = 1; level <= 7; level++) {
      const levelRewards = rewards.filter(r => r.level === level);
      const minSavings = levelRewards[0]?.min_savings || 0;
      console.log(`💎 Nivel ${level} ($${minSavings}+): ${levelRewards.length} recompensas`);
      levelRewards.forEach(r => console.log(`   ${r.icon_url} ${r.reward_title}`));
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error populating rewards:', error);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  populateRewards();
}

module.exports = { populateRewards };

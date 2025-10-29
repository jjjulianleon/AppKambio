const cron = require('node-cron');
const { User, NudgeSetting, Goal, ExpenseCategory } = require('../models');
const { sendPushNotification } = require('../utils/notifications');

// Nudge message templates
const nudgeTemplates = [
  {
    time: '10:00',
    messages: [
      '☕ ¿Hora del café? ¿O prefieres hacer un Kambio hacia {goalName}?',
      '🌟 ¡Buenos días! ¿Qué tal si hoy empiezas con un Kambio?',
      '💪 Cada pequeño ahorro cuenta. ¿Harás un Kambio hoy?'
    ]
  },
  {
    time: '15:00',
    messages: [
      '💰 ¡Vas genial! Ya llevas ${currentAmount} de ${targetAmount}. ¿Un Kambio más?',
      '🎯 Estás a {percentage}% de tu meta. ¡Sigue así!',
      '⏰ Hora de revisar: ¿evitaste algún gasto hormiga hoy?'
    ]
  },
  {
    time: '20:00',
    messages: [
      '🌙 ¿Pediste delivery? Si lo evitaste, ¡registra tu Kambio!',
      '✨ Fin del día: ¿lograste hacer algún Kambio hoy?',
      '🎉 Cada día es una oportunidad. ¿Registramos tu ahorro de hoy?'
    ]
  }
];

/**
 * Get random message for a specific time
 */
const getRandomMessage = (time) => {
  const template = nudgeTemplates.find(t => t.time === time);
  if (!template) return null;

  const randomIndex = Math.floor(Math.random() * template.messages.length);
  return template.messages[randomIndex];
};

/**
 * Personalize message with user data
 */
const personalizeMessage = (message, userData) => {
  return message
    .replace('{goalName}', userData.goalName || 'tu meta')
    .replace('{currentAmount}', userData.currentAmount || '0')
    .replace('{targetAmount}', userData.targetAmount || '100')
    .replace('{percentage}', userData.percentage || '0')
    .replace('{categoryName}', userData.categoryName || 'gasto hormiga');
};

/**
 * Send nudge notification to a user
 */
const sendNudgeToUser = async (user, time) => {
  try {
    // Check if user has push token
    if (!user.expo_push_token) {
      console.log(`User ${user.id} has no push token`);
      return;
    }

    // Get user's active goal
    const activeGoal = await Goal.findOne({
      where: {
        user_id: user.id,
        status: 'active'
      },
      order: [['created_at', 'DESC']]
    });

    if (!activeGoal) {
      console.log(`User ${user.id} has no active goal`);
      return;
    }

    // Get user's expense categories
    const categories = await ExpenseCategory.findAll({
      where: {
        user_id: user.id,
        is_active: true
      },
      limit: 1
    });

    // Prepare user data for personalization
    const userData = {
      goalName: activeGoal.name,
      currentAmount: parseFloat(activeGoal.current_amount).toFixed(2),
      targetAmount: parseFloat(activeGoal.target_amount).toFixed(2),
      percentage: activeGoal.getProgress().toFixed(0),
      categoryName: categories[0]?.category_name || 'gasto hormiga'
    };

    // Get and personalize message
    const message = getRandomMessage(time);
    if (!message) {
      console.log(`No message template for time ${time}`);
      return;
    }

    const personalizedMessage = personalizeMessage(message, userData);

    // Send notification
    const result = await sendPushNotification(
      user.expo_push_token,
      'Kambio 💪',
      personalizedMessage,
      {
        type: 'nudge',
        goalId: activeGoal.id,
        time
      }
    );

    console.log(`Nudge sent to user ${user.email} at ${time}:`, result.success ? 'Success' : 'Failed');
  } catch (error) {
    console.error(`Error sending nudge to user ${user.id}:`, error.message);
  }
};

/**
 * Send nudges to all eligible users at a specific time
 */
const sendScheduledNudges = async (time) => {
  try {
    console.log(`Running scheduled nudges for ${time}...`);

    // Find all users with active nudge settings for this time
    const nudgeSettings = await NudgeSetting.findAll({
      where: {
        is_active: true,
        [time]: time + ':00' // e.g., "10:00:00"
      },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    console.log(`Found ${nudgeSettings.length} users for ${time} nudges`);

    // Send nudge to each user
    for (const setting of nudgeSettings) {
      await sendNudgeToUser(setting.user, time);
    }

    console.log(`Finished sending ${time} nudges`);
  } catch (error) {
    console.error(`Error in sendScheduledNudges for ${time}:`, error.message);
  }
};

/**
 * Initialize cron jobs for nudges
 */
const initializeNudgeScheduler = () => {
  console.log('Initializing nudge scheduler...');

  // Schedule for 10:00 AM
  cron.schedule('0 10 * * *', () => {
    sendScheduledNudges('10:00');
  }, {
    timezone: 'America/Guayaquil' // Ecuador timezone
  });

  // Schedule for 3:00 PM
  cron.schedule('0 15 * * *', () => {
    sendScheduledNudges('15:00');
  }, {
    timezone: 'America/Guayaquil'
  });

  // Schedule for 8:00 PM
  cron.schedule('0 20 * * *', () => {
    sendScheduledNudges('20:00');
  }, {
    timezone: 'America/Guayaquil'
  });

  console.log('✓ Nudge scheduler initialized with 3 daily jobs');
};

/**
 * Send test nudge to a specific user
 */
const sendTestNudge = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    await sendNudgeToUser(user, '10:00');
    return { success: true, message: 'Test nudge sent' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeNudgeScheduler,
  sendNudgeToUser,
  sendScheduledNudges,
  sendTestNudge
};

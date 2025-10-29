const { Goal, Kambio, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get user's overall progress statistics
 */
const getUserProgressStats = async (userId) => {
  try {
    const goals = await Goal.findAll({
      where: { user_id: userId }
    });

    const kambios = await Kambio.findAll({
      where: { user_id: userId }
    });

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const totalSaved = kambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
    const totalKambios = kambios.length;

    return {
      total_goals: goals.length,
      active_goals: activeGoals.length,
      completed_goals: completedGoals.length,
      total_kambios: totalKambios,
      total_saved: totalSaved.toFixed(2),
      average_kambio: totalKambios > 0 ? (totalSaved / totalKambios).toFixed(2) : '0.00'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get detailed progress for a specific goal
 */
const getGoalDetailedProgress = async (goalId, userId) => {
  try {
    const goal = await Goal.findOne({
      where: { id: goalId, user_id: userId },
      include: [{
        model: Kambio,
        as: 'kambios',
        order: [['created_at', 'DESC']]
      }]
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const progress = goal.getProgress();
    const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
    const daysActive = Math.ceil((new Date() - new Date(goal.created_at)) / (1000 * 60 * 60 * 24));
    const averagePerDay = daysActive > 0 ? parseFloat(goal.current_amount) / daysActive : 0;
    const estimatedDaysToComplete = remaining > 0 && averagePerDay > 0
      ? Math.ceil(remaining / averagePerDay)
      : 0;

    return {
      goal_id: goal.id,
      goal_name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      remaining_amount: remaining.toFixed(2),
      progress_percentage: progress.toFixed(2),
      is_completed: goal.isCompleted(),
      status: goal.status,
      total_kambios: goal.kambios.length,
      days_active: daysActive,
      average_per_day: averagePerDay.toFixed(2),
      estimated_days_to_complete: estimatedDaysToComplete,
      created_at: goal.created_at,
      completed_at: goal.completed_at
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get kambios timeline for a user
 */
const getKambiosTimeline = async (userId, limit = 10) => {
  try {
    const kambios = await Kambio.findAll({
      where: { user_id: userId },
      include: [
        { model: Goal, as: 'goal' },
        { model: ExpenseCategory, as: 'expenseCategory' }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

    return kambios.map(k => ({
      id: k.id,
      amount: k.amount,
      description: k.description,
      goal_name: k.goal?.name,
      category_name: k.expenseCategory?.category_name,
      created_at: k.created_at
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get leaderboard (users with most savings)
 */
const getLeaderboard = async (limit = 10) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Kambio,
        as: 'kambios'
      }]
    });

    const leaderboard = users.map(user => {
      const totalSaved = user.kambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
      return {
        user_id: user.id,
        full_name: user.full_name || 'Usuario',
        total_saved: totalSaved,
        total_kambios: user.kambios.length
      };
    });

    // Sort by total saved
    leaderboard.sort((a, b) => b.total_saved - a.total_saved);

    return leaderboard.slice(0, limit);
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate streak (consecutive days with kambios)
 */
const calculateStreak = async (userId) => {
  try {
    const kambios = await Kambio.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    if (kambios.length === 0) {
      return { current_streak: 0, longest_streak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(kambios[0].created_at);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < kambios.length; i++) {
      const currentDate = new Date(kambios[i].created_at);
      currentDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Check if current streak is still active
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecentDate = new Date(kambios[0].created_at);
    mostRecentDate.setHours(0, 0, 0, 0);
    const daysSinceLastKambio = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastKambio <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProgressStats,
  getGoalDetailedProgress,
  getKambiosTimeline,
  getLeaderboard,
  calculateStreak
};

const { BattlePass, BattlePassReward, UserReward, BattlePassChallenge, UserChallenge, User, Kambio } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * Get or create current month's battle pass for user
 * GET /api/battle-pass/current
 */
exports.getCurrentBattlePass = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01

    let battlePass = await BattlePass.findOne({
      where: {
        user_id: userId,
        month: currentMonth
      },
      include: [
        {
          model: UserReward,
          as: 'rewards',
          include: [{
            model: BattlePassReward,
            as: 'reward'
          }]
        }
      ]
    });

    // Create if doesn't exist
    if (!battlePass) {
      battlePass = await BattlePass.create({
        user_id: userId,
        month: currentMonth,
        current_level: 0,
        total_savings: 0,
        total_points: 0,
        streak_days: 0
      });
    }

    // Get next level info
    const nextLevel = battlePass.getNextLevelThreshold();
    const progressPercentage = battlePass.getProgressPercentage();

    res.json({
      battlePass,
      nextLevel,
      progressPercentage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available rewards
 * GET /api/battle-pass/rewards
 */
exports.getAllRewards = async (req, res, next) => {
  try {
    const rewards = await BattlePassReward.findAll({
      where: { active: true },
      order: [['level', 'ASC']]
    });

    res.json({
      rewards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's earned rewards
 * GET /api/battle-pass/my-rewards
 */
exports.getMyRewards = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = { user_id: userId };
    if (status) {
      whereClause.status = status;
    }

    const userRewards = await UserReward.findAll({
      where: whereClause,
      include: [
        {
          model: BattlePassReward,
          as: 'reward'
        },
        {
          model: BattlePass,
          as: 'battlePass'
        }
      ],
      order: [['earned_at', 'DESC']]
    });

    res.json({
      rewards: userRewards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active challenges
 * GET /api/battle-pass/challenges
 */
exports.getActiveChallenges = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all active challenges
    const challenges = await BattlePassChallenge.findAll({
      where: { active: true }
    });

    // Get user's progress on these challenges
    const userChallenges = await UserChallenge.findAll({
      where: {
        user_id: userId,
        completed: false,
        expires_at: {
          [Op.or]: [
            { [Op.gt]: new Date() },
            { [Op.is]: null }
          ]
        }
      },
      include: [{
        model: BattlePassChallenge,
        as: 'challenge'
      }]
    });

    // Map challenges with user progress
    const challengesWithProgress = challenges.map(challenge => {
      const userChallenge = userChallenges.find(
        uc => uc.challenge_id === challenge.id
      );

      return {
        ...challenge.toJSON(),
        userProgress: userChallenge ? {
          progress: userChallenge.progress,
          completed: userChallenge.completed,
          percentage: (userChallenge.progress / challenge.target_value) * 100
        } : {
          progress: 0,
          completed: false,
          percentage: 0
        }
      };
    });

    res.json({
      challenges: challengesWithProgress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get battle pass history
 * GET /api/battle-pass/history
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const battlePasses = await BattlePass.findAll({
      where: { user_id: userId },
      order: [['month', 'DESC']],
      limit: 12, // Last 12 months
      include: [{
        model: UserReward,
        as: 'rewards',
        attributes: ['id']
      }]
    });

    const history = battlePasses.map(bp => {
      // Parse YYYY-MM-DD string safely
      const [year, month] = bp.month.split('-');

      return {
        ...bp.toJSON(),
        month: parseInt(month),
        year: parseInt(year),
        // Count actual rewards earned
        unlockedRewards: bp.rewards ? bp.rewards.length : 0,
        completedChallenges: bp.completed_challenges ? bp.completed_challenges.length : 0
      };
    });

    res.json({
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redeem a reward
 * POST /api/battle-pass/redeem/:rewardId
 */
exports.redeemReward = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { rewardId } = req.params;
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    // Get current battle pass
    const battlePass = await BattlePass.findOne({
      where: {
        user_id: userId,
        month: currentMonth
      }
    });

    if (!battlePass) {
      await transaction.rollback();
      return res.status(404).json({ error: 'No battle pass found for current month' });
    }

    // Get reward
    const reward = await BattlePassReward.findByPk(rewardId);
    if (!reward) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Reward not found' });
    }

    // Check if user has reached the required level
    if (parseFloat(battlePass.total_savings) < parseFloat(reward.min_savings)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Insufficient savings to unlock this reward',
        required: reward.min_savings,
        current: battlePass.total_savings
      });
    }

    // Check if already redeemed
    const existing = await UserReward.findOne({
      where: {
        user_id: userId,
        reward_id: rewardId,
        battle_pass_id: battlePass.id
      }
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Reward already redeemed' });
    }

    // Create user reward
    const userReward = await UserReward.create({
      user_id: userId,
      battle_pass_id: battlePass.id,
      reward_id: rewardId,
      earned_at: new Date(),
      status: 'AVAILABLE',
      code: generateRewardCode()
    }, { transaction });

    await transaction.commit();

    // Fetch complete reward
    const completeReward = await UserReward.findByPk(userReward.id, {
      include: [{
        model: BattlePassReward,
        as: 'reward'
      }]
    });

    res.json({
      message: 'Reward redeemed successfully',
      userReward: completeReward
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get monthly statistics
 * GET /api/battle-pass/monthly-stats
 */
exports.getMonthlyStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';

    const battlePass = await BattlePass.findOne({
      where: {
        user_id: userId,
        month: targetMonth
      }
    });

    if (!battlePass) {
      return res.json({
        stats: {
          total_savings: 0,
          current_level: 0,
          total_points: 0,
          streak_days: 0,
          rewards_earned: 0,
          challenges_completed: 0
        }
      });
    }

    // Count rewards earned this month
    const rewardsCount = await UserReward.count({
      where: {
        user_id: userId,
        battle_pass_id: battlePass.id
      }
    });

    // Count completed challenges
    const challengesCount = battlePass.completed_challenges.length;

    res.json({
      stats: {
        total_savings: parseFloat(battlePass.total_savings),
        current_level: battlePass.current_level,
        total_points: battlePass.total_points,
        streak_days: battlePass.streak_days,
        rewards_earned: rewardsCount,
        challenges_completed: challengesCount,
        progress_percentage: battlePass.getProgressPercentage()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update battle pass with new savings
 * This is called internally when a Kambio is created
 * POST /api/battle-pass/update-savings
 */
exports.updateSavings = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    // Get or create battle pass
    let battlePass = await BattlePass.findOne({
      where: {
        user_id: userId,
        month: currentMonth
      }
    });

    if (!battlePass) {
      battlePass = await BattlePass.create({
        user_id: userId,
        month: currentMonth,
        current_level: 0,
        total_savings: 0,
        total_points: 0,
        streak_days: 0
      }, { transaction });
    }

    const previousLevel = battlePass.current_level;

    // Update savings
    await battlePass.updateSavings(amount);

    const newLevel = battlePass.current_level;
    const leveledUp = newLevel > previousLevel;

    // If leveled up, check for new rewards to unlock
    let unlockedRewards = [];
    if (leveledUp) {
      const rewards = await BattlePassReward.findAll({
        where: {
          level: {
            [Op.gt]: previousLevel,
            [Op.lte]: newLevel
          },
          active: true
        }
      });

      unlockedRewards = rewards;
    }

    await transaction.commit();

    res.json({
      message: 'Battle pass updated successfully',
      battlePass,
      leveledUp,
      unlockedRewards
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Helper function to generate reward codes
 */
function generateRewardCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

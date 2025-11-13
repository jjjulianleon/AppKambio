const { Kambio, Goal, ExpenseCategory, BattlePass } = require('../models');
const { sequelize } = require('../config/database');

// Get all user kambios
exports.getAllKambios = async (req, res, next) => {
  try {
    const kambios = await Kambio.findAll({
      where: { user_id: req.userId },
      attributes: [
        'id',
        'user_id',
        'goal_id',
        'expense_category_id',
        'amount',
        'transaction_type',
        'pool_contribution_id',
        'pool_request_id',
        'description',
        'created_at',
        'updated_at'
      ],
      include: [
        { model: Goal, as: 'goal' },
        { model: ExpenseCategory, as: 'expenseCategory' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ kambios });
  } catch (error) {
    next(error);
  }
};

// Get kambios by goal
exports.getKambiosByGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const kambios = await Kambio.findAll({
      where: {
        user_id: req.userId,
        goal_id: goalId
      },
      include: [
        { model: ExpenseCategory, as: 'expenseCategory' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ kambios });
  } catch (error) {
    next(error);
  }
};

// Create new kambio (register savings)
exports.createKambio = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { goal_id, expense_category_id, amount, description } = req.body;

    // Validate required fields
    if (!goal_id || !amount) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'ID de meta y monto son obligatorios'
      });
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'El monto debe ser mayor a 0'
      });
    }

    // Find goal
    const goal = await Goal.findOne({
      where: { id: goal_id, user_id: req.userId }
    });

    if (!goal) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    if (goal.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'La meta no está activa'
      });
    }

    // Create kambio
    const kambio = await Kambio.create({
      user_id: req.userId,
      goal_id,
      expense_category_id: expense_category_id || null,
      amount,
      description: description || null
    }, { transaction });

    // Update goal current_amount
    const newAmount = parseFloat(goal.current_amount) + parseFloat(amount);
    goal.current_amount = newAmount;

    // Check if goal is completed
    if (goal.isCompleted() && goal.status === 'active') {
      goal.status = 'completed';
      goal.completed_at = new Date();
    }

    await goal.save({ transaction });

    // Update Battle Pass with the savings
    // Create a date representing the first day of the current month (YYYY-MM-01)
    const currentDate = new Date();
    const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7) + '-01'; // Format: YYYY-MM-01

    let battlePass = await BattlePass.findOne({
      where: {
        user_id: req.userId,
        month: monthKey
      }
    });

    // Create battle pass if doesn't exist for current month
    if (!battlePass) {
      battlePass = await BattlePass.create({
        user_id: req.userId,
        month: monthKey,
        total_savings: 0,
        current_level: 0,
        total_points: 0,
        completed_challenges: [],
        streak_days: 0
      }, { transaction });
    }

    // Update battle pass savings and level
    const newBattlePassSavings = parseFloat(battlePass.total_savings) + parseFloat(amount);
    battlePass.total_savings = newBattlePassSavings;

    // Define level thresholds
    const levels = [
      { level: 7, min: 300 },
      { level: 6, min: 200 },
      { level: 5, min: 150 },
      { level: 4, min: 100 },
      { level: 3, min: 75 },
      { level: 2, min: 50 },
      { level: 1, min: 25 },
      { level: 0, min: 0 }
    ];

    // Calculate new level
    for (const levelInfo of levels) {
      if (newBattlePassSavings >= levelInfo.min) {
        battlePass.current_level = levelInfo.level;
        break;
      }
    }

    await battlePass.save({ transaction });

    await transaction.commit();

    // Fetch complete kambio with relationships
    const completeKambio = await Kambio.findByPk(kambio.id, {
      include: [
        { model: Goal, as: 'goal' },
        { model: ExpenseCategory, as: 'expenseCategory' }
      ]
    });

    res.status(201).json({
      message: 'Kambio registrado exitosamente',
      kambio: completeKambio,
      goal_updated: {
        current_amount: goal.current_amount,
        progress: goal.getProgress(),
        is_completed: goal.isCompleted()
      },
      battle_pass_updated: {
        total_savings: battlePass.total_savings,
        current_level: battlePass.current_level
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete kambio
exports.deleteKambio = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const kambio = await Kambio.findOne({
      where: { id, user_id: req.userId },
      include: [{ model: Goal, as: 'goal' }]
    });

    if (!kambio) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Kambio no encontrado' });
    }

    // Update goal current_amount (subtract)
    const goal = kambio.goal;
    const newAmount = parseFloat(goal.current_amount) - parseFloat(kambio.amount);
    goal.current_amount = Math.max(0, newAmount);

    // If goal was completed, mark as active again
    if (goal.status === 'completed') {
      goal.status = 'active';
      goal.completed_at = null;
    }

    await goal.save({ transaction });

    // Update Battle Pass (subtract the savings)
    // Create a date representing the first day of the current month (YYYY-MM-01)
    const currentDate = new Date();
    const monthKey = currentDate.toISOString().split('T')[0].slice(0, 7) + '-01'; // Format: YYYY-MM-01

    const battlePass = await BattlePass.findOne({
      where: {
        user_id: req.userId,
        month: monthKey
      }
    });

    if (battlePass) {
      // Subtract the amount
      const newBattlePassSavings = Math.max(0, parseFloat(battlePass.total_savings) - parseFloat(kambio.amount));
      battlePass.total_savings = newBattlePassSavings;

      // Recalculate level
      const levels = [
        { level: 7, min: 300 },
        { level: 6, min: 200 },
        { level: 5, min: 150 },
        { level: 4, min: 100 },
        { level: 3, min: 75 },
        { level: 2, min: 50 },
        { level: 1, min: 25 },
        { level: 0, min: 0 }
      ];

      for (const levelInfo of levels) {
        if (newBattlePassSavings >= levelInfo.min) {
          battlePass.current_level = levelInfo.level;
          break;
        }
      }

      await battlePass.save({ transaction });
    }

    await kambio.destroy({ transaction });

    await transaction.commit();

    res.json({ message: 'Kambio eliminado exitosamente' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get kambio statistics
exports.getKambioStats = async (req, res, next) => {
  try {
    const kambios = await Kambio.findAll({
      where: { user_id: req.userId }
    });

    const totalKambios = kambios.length;
    const totalAmount = kambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);
    const averageAmount = totalKambios > 0 ? totalAmount / totalKambios : 0;

    res.json({
      total_kambios: totalKambios,
      total_amount: totalAmount.toFixed(2),
      average_amount: averageAmount.toFixed(2)
    });
  } catch (error) {
    next(error);
  }
};

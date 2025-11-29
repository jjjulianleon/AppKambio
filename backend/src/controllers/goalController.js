const { Goal, Kambio, UserSavings, ExpenseCategory, sequelize } = require('../models');

// Get all user goals - NEW GENERAL SAVINGS SYSTEM
exports.getAllGoals = async (req, res, next) => {
  try {
    const goals = await Goal.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Kambio,
          as: 'kambios'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get current month general savings
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const userSavings = await UserSavings.findOne({
      where: {
        user_id: req.userId,
        month,
        year
      }
    });

    const totalSaved = userSavings ? parseFloat(userSavings.total_saved) : 0;

    // NEW: Get total kambio count for the user (General Savings count)
    const totalKambios = await Kambio.count({
      where: { user_id: req.userId }
    });

    // Add general savings info to each goal
    const goalsWithSavings = goals.map(goal => {
      const goalData = goal.toJSON();
      const targetAmount = parseFloat(goal.target_amount);

      // For active goals, current_amount is based on general savings (up to target)
      // For completed goals, use completed_amount
      const displayAmount = goal.status === 'completed'
        ? parseFloat(goal.completed_amount || goal.target_amount)
        : Math.min(totalSaved, targetAmount);

      const canBeCompleted = goal.status === 'active' && totalSaved >= targetAmount;

      return {
        ...goalData,
        current_amount: displayAmount, // Override with calculated amount
        general_savings_total: totalSaved,
        can_be_completed: canBeCompleted,
        kambio_count: totalKambios // Include total kambio count
      };
    });

    res.json({
      goals: goalsWithSavings,
      general_savings: {
        total_saved: totalSaved,
        month,
        year
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single goal by ID - NEW GENERAL SAVINGS SYSTEM
exports.getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      where: { id, user_id: req.userId },
      include: [
        {
          model: Kambio,
          as: 'kambios',
          order: [['created_at', 'DESC']]
        }
      ]
    });

    // NEW: Get recent general kambios (since they are not tied to goals anymore)
    const recentKambios = await Kambio.findAll({
      where: { user_id: req.userId },
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: ExpenseCategory, as: 'expenseCategory' }
      ]
    });

    if (!goal) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    // Get current month general savings
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const userSavings = await UserSavings.findOne({
      where: {
        user_id: req.userId,
        month,
        year
      }
    });

    const totalSaved = userSavings ? parseFloat(userSavings.total_saved) : 0;
    const goalData = goal.toJSON();
    const targetAmount = parseFloat(goal.target_amount);

    // Calculate display amount based on general savings
    const displayAmount = goal.status === 'completed'
      ? parseFloat(goal.completed_amount || 0)
      : Math.min(totalSaved, targetAmount);

    const canBeCompleted = goal.status === 'active' && totalSaved >= targetAmount;

    res.json({
      goal: {
        ...goalData,
        current_amount: displayAmount,
        general_savings_total: totalSaved,
        can_be_completed: canBeCompleted,
        recent_kambios: recentKambios // Include recent general activity
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new goal
exports.createGoal = async (req, res, next) => {
  try {
    const { name, target_amount, image_url } = req.body;

    // Validate required fields
    if (!name || !target_amount) {
      return res.status(400).json({
        error: 'Nombre y monto objetivo son obligatorios'
      });
    }

    // Validate target_amount
    if (parseFloat(target_amount) < 10) {
      return res.status(400).json({
        error: 'El monto objetivo debe ser al menos $10'
      });
    }

    const goal = await Goal.create({
      user_id: req.userId,
      name,
      target_amount,
      image_url
    });

    res.status(201).json({
      message: 'Meta creada exitosamente',
      goal
    });
  } catch (error) {
    next(error);
  }
};

// Update goal
exports.updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, target_amount, image_url, status } = req.body;

    const goal = await Goal.findOne({
      where: { id, user_id: req.userId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    // Update fields
    if (name !== undefined) goal.name = name;
    if (target_amount !== undefined) {
      if (parseFloat(target_amount) < 10) {
        return res.status(400).json({
          error: 'El monto objetivo debe ser al menos $10'
        });
      }
      goal.target_amount = target_amount;
    }
    if (image_url !== undefined) goal.image_url = image_url;
    if (status !== undefined) goal.status = status;

    // Check if goal is completed
    if (goal.isCompleted() && goal.status === 'active') {
      goal.status = 'completed';
      goal.completed_at = new Date();
    }

    await goal.save();

    res.json({
      message: 'Meta actualizada exitosamente',
      goal
    });
  } catch (error) {
    next(error);
  }
};

// Delete goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      where: { id, user_id: req.userId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    await goal.destroy();

    res.json({ message: 'Meta eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Get goal progress
exports.getGoalProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      where: { id, user_id: req.userId }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    const progress = goal.getProgress();
    const isCompleted = goal.isCompleted();

    res.json({
      goal_id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      progress: progress.toFixed(2),
      is_completed: isCompleted
    });
  } catch (error) {
    next(error);
  }
};


// Complete goal - NEW GENERAL SAVINGS SYSTEM
// Withdraws goal amount from general savings pool
exports.completeGoal = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    console.log(`Attempting to complete goal ${id} for user ${req.userId}`);

    // Find goal
    const goal = await Goal.findOne({
      where: { id, user_id: req.userId }
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

    // Get current month savings
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const userSavings = await UserSavings.findOne({
      where: {
        user_id: req.userId,
        month,
        year
      }
    });

    if (!userSavings) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'No tienes ahorros registrados este mes'
      });
    }

    const targetAmount = parseFloat(goal.target_amount);
    const totalSaved = parseFloat(userSavings.total_saved);

    // Check if user has enough savings
    if (totalSaved < targetAmount) {
      await transaction.rollback();
      return res.status(400).json({
        error: `No tienes suficientes ahorros. Necesitas ${targetAmount.toFixed(2)}, tienes ${totalSaved.toFixed(2)}`
      });
    }

    console.log(`Savings check passed: ${totalSaved} >= ${targetAmount}`);

    // Update goal
    goal.status = 'completed';
    goal.completed_at = new Date();
    goal.completed_amount = targetAmount;
    await goal.save({ transaction });

    // Deduct from general savings
    userSavings.total_saved = totalSaved - targetAmount;
    await userSavings.save({ transaction });

    // Create a kambio record to track the completion
    await Kambio.create({
      user_id: req.userId,
      goal_id: goal.id,
      amount: -targetAmount, // Negative to show withdrawal
      transaction_type: 'complete_goal',
      description: `Meta completada: ${goal.name}`
    }, { transaction });

    await transaction.commit();
    console.log('Goal completion transaction committed successfully');

    res.json({
      message: 'Meta completada exitosamente',
      goal: {
        id: goal.id,
        name: goal.name,
        target_amount: goal.target_amount,
        completed_amount: goal.completed_amount,
        completed_at: goal.completed_at,
        status: goal.status
      },
      savings_updated: {
        previous_total: totalSaved,
        withdrawn: targetAmount,
        new_total: userSavings.total_saved
      }
    });
  } catch (error) {
    console.error('Error completing goal:', error);
    await transaction.rollback();
    next(error);
  }
};

const { Goal, Kambio } = require('../models');

// Get all user goals
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

    res.json({ goals });
  } catch (error) {
    next(error);
  }
};

// Get single goal by ID
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

    if (!goal) {
      return res.status(404).json({ error: 'Meta no encontrada' });
    }

    res.json({ goal });
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

const { SavingsPool, PoolMembership, PoolRequest, PoolContribution, User, Goal, Kambio, UserSavings } = require('../models');
const { Op } = require('sequelize');

/**
 * Get current pool data for the user
 */
exports.getPoolData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's pool membership
    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true },
      include: [
        {
          model: SavingsPool,
          as: 'pool',
          where: { is_active: true }
        }
      ]
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No estás en ningún pozo de ahorro'
      });
    }

    const poolId = membership.pool.id;

    // Get all members
    const members = await PoolMembership.findAll({
      where: { pool_id: poolId, is_active: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    // Calculate each member's total savings
    const membersWithSavings = await Promise.all(
      members.map(async (member) => {
        // NEW: Get savings from UserSavings table
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const userSavings = await UserSavings.findOne({
          where: {
            user_id: member.user_id,
            month,
            year
          }
        });

        const totalSavings = userSavings ? parseFloat(userSavings.total_saved) : 0;

        return {
          id: member.user.id,
          name: member.user.full_name,
          email: member.user.email,
          totalSavings: totalSavings,
          photo: null
        };
      })
    );

    // Get active requests
    const activeRequests = await PoolRequest.findAll({
      where: {
        pool_id: poolId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        },
        {
          model: PoolContribution,
          as: 'contributions',
          include: [
            {
              model: User,
              as: 'contributor',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedActiveRequests = activeRequests.map(req => ({
      id: req.id,
      requester: req.requester.full_name,
      requesterId: req.requester.id,
      amount: parseFloat(req.amount),
      currentAmount: parseFloat(req.current_amount),
      description: req.description,
      contributors: req.contributions.length,
      createdAt: req.created_at
    }));

    // Get completed requests
    const completedRequests = await PoolRequest.findAll({
      where: {
        pool_id: poolId,
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: 10
    });

    const formattedCompletedRequests = completedRequests.map(req => ({
      id: req.id,
      requester: req.requester.full_name,
      requesterId: req.requester.id,
      amount: parseFloat(req.amount),
      description: req.description,
      completedAt: req.completed_at
    }));

    // Get user's total savings - NEW GENERAL SAVINGS SYSTEM
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const userSavingsRecord = await UserSavings.findOne({
      where: {
        user_id: userId,
        month,
        year
      }
    });

    const userSavings = userSavingsRecord ? parseFloat(userSavingsRecord.total_saved) : 0;

    res.json({
      success: true,
      members: membersWithSavings,
      activeRequests: formattedActiveRequests,
      completedRequests: formattedCompletedRequests,
      userSavings: userSavings
    });
  } catch (error) {
    console.error('Error getting pool data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del pozo',
      error: error.message
    });
  }
};

/**
 * Get pool members
 */
exports.getPoolMembers = async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No estás en ningún pozo de ahorro'
      });
    }

    const members = await PoolMembership.findAll({
      where: { pool_id: membership.pool_id, is_active: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    const membersWithSavings = await Promise.all(
      members.map(async (member) => {
        // NEW: Get savings from UserSavings table
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const userSavings = await UserSavings.findOne({
          where: {
            user_id: member.user_id,
            month,
            year
          }
        });

        const totalSavings = userSavings ? parseFloat(userSavings.total_saved) : 0;

        return {
          id: member.user.id,
          name: member.user.full_name,
          totalSavings: totalSavings
        };
      })
    );

    res.json({
      success: true,
      members: membersWithSavings
    });
  } catch (error) {
    console.error('Error getting pool members:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener miembros del pozo',
      error: error.message
    });
  }
};

/**
 * Create a new funding request
 */
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;

    // Validation
    if (!amount || amount < 5) {
      return res.status(400).json({
        success: false,
        message: 'El monto mínimo es $5'
      });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'La descripción debe tener al menos 10 caracteres'
      });
    }

    // Find user's pool
    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No estás en ningún pozo de ahorro'
      });
    }

    // Create the request
    const request = await PoolRequest.create({
      pool_id: membership.pool_id,
      requester_id: userId,
      amount: amount,
      current_amount: 0,
      description: description.trim(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      request: {
        id: request.id,
        amount: parseFloat(request.amount),
        description: request.description,
        createdAt: request.created_at
      }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la solicitud',
      error: error.message
    });
  }
};

/**
 * Contribute to a request
 */
exports.contributeToRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    let { amount } = req.body;

    // Find the request
    const request = await PoolRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (request.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Esta solicitud ya no está activa'
      });
    }

    // Can't contribute to your own request
    if (request.requester_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes contribuir a tu propia solicitud'
      });
    }

    // Calculate user's savings
    const userGoals = await Goal.findAll({
      where: { user_id: userId, status: 'active' }
    });

    const userSavings = userGoals.reduce((sum, goal) => {
      return sum + parseFloat(goal.current_amount || 0);
    }, 0);

    // Get pool members count
    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    const membersCount = await PoolMembership.count({
      where: { pool_id: membership.pool_id, is_active: true }
    });

    // Calculate contribution if not provided
    if (!amount) {
      const remaining = parseFloat(request.amount) - parseFloat(request.current_amount);
      const proportionalAmount = remaining / membersCount;
      const maxFromSavings = userSavings * 0.5; // Max 50% of savings
      amount = Math.min(proportionalAmount, maxFromSavings, remaining);
    }

    // Validate contribution amount
    const maxContribution = userSavings * 0.5;
    if (amount > maxContribution) {
      return res.status(400).json({
        success: false,
        message: `Solo puedes contribuir hasta $${maxContribution.toFixed(2)} (50% de tus ahorros)`
      });
    }

    const remaining = parseFloat(request.amount) - parseFloat(request.current_amount);
    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Solo faltan $${remaining.toFixed(2)} para completar la solicitud`
      });
    }

    // Users can contribute multiple times, so we removed the check for existing contributions

    // Create contribution
    const contribution = await PoolContribution.create({
      request_id: requestId,
      contributor_id: userId,
      amount: amount
    });

    // Update request current amount
    const newCurrentAmount = parseFloat(request.current_amount) + amount;
    await request.update({
      current_amount: newCurrentAmount
    });

    // Check if request is completed
    const isNowCompleted = newCurrentAmount >= parseFloat(request.amount);
    if (isNowCompleted) {
      await request.update({
        status: 'completed',
        completed_at: new Date()
      });

      // Transfer the total amount to the requester's goals
      const totalAmount = parseFloat(request.amount);
      const requesterGoals = await Goal.findAll({
        where: { user_id: request.requester_id, status: 'active' },
        order: [['created_at', 'ASC']] // Add to oldest goals first
      });

      if (requesterGoals.length > 0) {
        // Distribute proportionally across requester's goals
        const totalGoalAmount = requesterGoals.reduce((sum, goal) => sum + parseFloat(goal.current_amount), 0);

        if (totalGoalAmount > 0) {
          // Distribute proportionally
          for (const goal of requesterGoals) {
            const goalPercentage = parseFloat(goal.current_amount) / totalGoalAmount;
            const addAmount = totalAmount * goalPercentage;
            const newGoalAmount = parseFloat(goal.current_amount) + addAmount;
            await goal.update({ current_amount: newGoalAmount });

            // Create a credit Kambio for the received funds
            if (addAmount > 0) {
              await Kambio.create({
                user_id: request.requester_id,
                goal_id: goal.id,
                amount: addAmount,
                transaction_type: 'credit',
                pool_request_id: requestId,
                description: `Recibido del Pozo de Ahorro - Solicitud completada: ${request.description}`
              });
            }
          }
        } else {
          // If all goals have 0 balance, add to first goal
          const firstGoal = requesterGoals[0];
          await firstGoal.update({
            current_amount: parseFloat(firstGoal.current_amount) + totalAmount
          });

          await Kambio.create({
            user_id: request.requester_id,
            goal_id: firstGoal.id,
            amount: totalAmount,
            transaction_type: 'credit',
            pool_request_id: requestId,
            description: `Recibido del Pozo de Ahorro - Solicitud completada: ${request.description}`
          });
        }
      } else {
        // If requester has no active goals, we can't add the funds
        console.warn(`Requester ${request.requester_id} has no active goals to receive pool funds`);
      }
    }

    // Deduct from user's general savings and create debit Kambio
    if (userSavingsRecord && userSavingsRecord.total_saved >= amount) {
      // Deduct from general savings
      userSavingsRecord.total_saved = parseFloat(userSavingsRecord.total_saved) - amount;
      await userSavingsRecord.save();

      // Create a debit Kambio to track the contribution
      await Kambio.create({
        user_id: userId,
        goal_id: null, // General savings
        amount: amount,
        transaction_type: 'debit',
        pool_contribution_id: contribution.id,
        description: `Contribución al Pozo - ${request.requester.full_name}: ${request.description}`
      });
    } else {
      console.log('User has no savings in goals, cannot contribute');
      return res.status(400).json({
        success: false,
        message: 'No tienes ahorros disponibles para contribuir'
      });
    }

    res.json({
      success: true,
      message: 'Contribución realizada exitosamente',
      contribution: {
        id: contribution.id,
        amount: parseFloat(contribution.amount),
        requestCompleted: newCurrentAmount >= parseFloat(request.amount)
      }
    });
  } catch (error) {
    console.error('Error contributing to request:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId,
      requestId
    });
    res.status(500).json({
      success: false,
      message: 'Error al realizar la contribución',
      error: error.message
    });
  }
};

/**
 * Calculate contribution amount for a request
 */
exports.calculateContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await PoolRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Calculate user's savings - NEW GENERAL SAVINGS SYSTEM
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const userSavingsRecord = await UserSavings.findOne({
      where: {
        user_id: userId,
        month,
        year
      }
    });

    const userSavings = userSavingsRecord ? parseFloat(userSavingsRecord.total_saved) : 0;

    // Get pool members count
    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    const membersCount = await PoolMembership.count({
      where: { pool_id: membership.pool_id, is_active: true }
    });

    const remaining = parseFloat(request.amount) - parseFloat(request.current_amount);
    const proportionalAmount = remaining / membersCount;
    const maxFromSavings = userSavings * 0.5;
    const calculatedAmount = Math.min(proportionalAmount, maxFromSavings, remaining);

    res.json({
      success: true,
      amount: Math.max(0, calculatedAmount),
      maxPossible: maxFromSavings,
      remaining: remaining
    });
  } catch (error) {
    console.error('Error calculating contribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular la contribución',
      error: error.message
    });
  }
};

/**
 * Get user's requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await PoolRequest.findAll({
      where: { requester_id: userId },
      order: [['created_at', 'DESC']]
    });

    const formattedRequests = requests.map(req => ({
      id: req.id,
      amount: parseFloat(req.amount),
      currentAmount: parseFloat(req.current_amount),
      description: req.description,
      status: req.status,
      createdAt: req.created_at,
      completedAt: req.completed_at
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Error getting user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus solicitudes',
      error: error.message
    });
  }
};

/**
 * Get active requests
 */
exports.getActiveRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No estás en ningún pozo de ahorro'
      });
    }

    const requests = await PoolRequest.findAll({
      where: {
        pool_id: membership.pool_id,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedRequests = requests.map(req => ({
      id: req.id,
      requester: req.requester.full_name,
      requesterId: req.requester.id,
      amount: parseFloat(req.amount),
      currentAmount: parseFloat(req.current_amount),
      description: req.description,
      createdAt: req.created_at
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Error getting active requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes activas',
      error: error.message
    });
  }
};

/**
 * Get completed requests
 */
exports.getCompletedRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await PoolMembership.findOne({
      where: { user_id: userId, is_active: true }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'No estás en ningún pozo de ahorro'
      });
    }

    const requests = await PoolRequest.findAll({
      where: {
        pool_id: membership.pool_id,
        status: 'completed'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['completed_at', 'DESC']],
      limit: 20
    });

    const formattedRequests = requests.map(req => ({
      id: req.id,
      requester: req.requester.full_name,
      requesterId: req.requester.id,
      amount: parseFloat(req.amount),
      description: req.description,
      completedAt: req.completed_at
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('Error getting completed requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes completadas',
      error: error.message
    });
  }
};

/**
 * Delete a request and refund all contributions
 */
exports.deleteRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find the request
    const request = await PoolRequest.findByPk(requestId, {
      include: [
        {
          model: PoolContribution,
          as: 'contributions',
          include: [
            {
              model: User,
              as: 'contributor',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Only the requester can delete their request
    if (request.requester_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo el creador de la solicitud puede borrarla'
      });
    }

    // Can't delete completed requests
    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No puedes borrar una solicitud completada'
      });
    }

    // Refund all contributions
    const contributions = request.contributions || [];
    const refundedUsers = [];

    for (const contribution of contributions) {
      const contributorId = contribution.contributor_id;
      const contributionAmount = parseFloat(contribution.amount);

      // Get contributor's active goals
      const contributorGoals = await Goal.findAll({
        where: { user_id: contributorId, status: 'active' },
        order: [['created_at', 'ASC']] // Refund to oldest goals first
      });

      if (contributorGoals.length > 0) {
        // Distribute refund proportionally across goals
        const totalGoalAmount = contributorGoals.reduce((sum, goal) => sum + parseFloat(goal.current_amount), 0);

        if (totalGoalAmount > 0) {
          // Refund proportionally
          for (const goal of contributorGoals) {
            const goalPercentage = parseFloat(goal.current_amount) / totalGoalAmount;
            const refundAmount = contributionAmount * goalPercentage;
            const newAmount = parseFloat(goal.current_amount) + refundAmount;
            await goal.update({ current_amount: newAmount });

            // Create a credit Kambio for the refund
            if (refundAmount > 0) {
              await Kambio.create({
                user_id: contributorId,
                goal_id: goal.id,
                amount: refundAmount,
                transaction_type: 'credit',
                pool_contribution_id: contribution.id,
                description: `Reembolso de contribución al Pozo - Solicitud cancelada`
              });
            }
          }
        } else {
          // If all goals have 0 balance, add to first goal
          const firstGoal = contributorGoals[0];
          await firstGoal.update({
            current_amount: parseFloat(firstGoal.current_amount) + contributionAmount
          });

          await Kambio.create({
            user_id: contributorId,
            goal_id: firstGoal.id,
            amount: contributionAmount,
            transaction_type: 'credit',
            pool_contribution_id: contribution.id,
            description: `Reembolso de contribución al Pozo - Solicitud cancelada`
          });
        }

        refundedUsers.push({
          id: contributorId,
          name: contribution.contributor.full_name,
          amount: contributionAmount
        });
      }
    }

    // Delete all contributions
    await PoolContribution.destroy({
      where: { request_id: requestId }
    });

    // Delete the request
    await request.destroy();

    res.json({
      success: true,
      message: 'Solicitud borrada exitosamente',
      refundedUsers: refundedUsers,
      totalRefunded: contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      success: false,
      message: 'Error al borrar la solicitud',
      error: error.message
    });
  }
};

module.exports = exports;

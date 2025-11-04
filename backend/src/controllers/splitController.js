const { ExpenseShare, ExpenseShareMember, ExpenseShareItem, User } = require('../models');
const { sequelize } = require('../config/database');

/**
 * Create a new expense split
 * POST /api/splits
 */
exports.createSplit = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { title, total_amount, split_type, description, members, items } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title || !total_amount || !split_type) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Missing required fields: title, total_amount, split_type'
      });
    }

    if (!members || members.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'At least one member is required'
      });
    }

    // Create the expense share
    const expenseShare = await ExpenseShare.create({
      user_id: userId,
      title,
      total_amount,
      split_type,
      description,
      status: 'ACTIVE'
    }, { transaction });

    // Add members
    const memberPromises = members.map(member => {
      return ExpenseShareMember.create({
        share_id: expenseShare.id,
        user_id: member.user_id,
        amount_owed: member.amount_owed || 0,
        amount_paid: member.amount_paid || 0,
        percentage: member.percentage || null,
        status: 'PENDING'
      }, { transaction });
    });

    await Promise.all(memberPromises);

    // Add items if split type is ITEMS
    if (split_type === 'ITEMS' && items && items.length > 0) {
      const itemPromises = items.map(item => {
        return ExpenseShareItem.create({
          share_id: expenseShare.id,
          name: item.name,
          price: item.price,
          assigned_to: item.assigned_to
        }, { transaction });
      });

      await Promise.all(itemPromises);
    }

    await transaction.commit();

    // Fetch the complete expense share with members and items
    const completeSplit = await ExpenseShare.findByPk(expenseShare.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: ExpenseShareMember,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email']
          }]
        },
        {
          model: ExpenseShareItem,
          as: 'items',
          include: [{
            model: User,
            as: 'assignee',
            attributes: ['id', 'full_name', 'email']
          }]
        }
      ]
    });

    res.status(201).json({
      message: 'Expense split created successfully',
      split: completeSplit
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get all expense splits for current user
 * GET /api/splits
 */
exports.getMySplits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    // Get splits created by user
    const createdSplits = await ExpenseShare.findAll({
      where: {
        user_id: userId,
        ...whereClause
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: ExpenseShareMember,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get splits where user is a member
    const memberSplits = await ExpenseShareMember.findAll({
      where: { user_id: userId },
      include: [{
        model: ExpenseShare,
        as: 'expenseShare',
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: ExpenseShareMember,
            as: 'members',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email']
            }]
          }
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    const allSplits = [
      ...createdSplits,
      ...memberSplits.map(m => m.expenseShare)
    ];

    // Remove duplicates
    const uniqueSplits = Array.from(
      new Map(allSplits.map(split => [split.id, split])).values()
    );

    res.json({
      splits: uniqueSplits,
      count: uniqueSplits.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense split details
 * GET /api/splits/:id
 */
exports.getSplitDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const split = await ExpenseShare.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: ExpenseShareMember,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email']
          }]
        },
        {
          model: ExpenseShareItem,
          as: 'items',
          include: [{
            model: User,
            as: 'assignee',
            attributes: ['id', 'full_name', 'email']
          }]
        }
      ]
    });

    if (!split) {
      return res.status(404).json({ error: 'Expense split not found' });
    }

    // Check if user has access to this split
    const isMember = split.members.some(m => m.user_id === userId);
    const isCreator = split.user_id === userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate split amounts
    const debtSummary = await split.getDebtSummary();

    res.json({
      split,
      debtSummary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update expense split
 * PUT /api/splits/:id
 */
exports.updateSplit = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status } = req.body;

    const split = await ExpenseShare.findByPk(id);

    if (!split) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Expense split not found' });
    }

    // Only creator can update
    if (split.user_id !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Only the creator can update this split' });
    }

    // Update fields
    if (title) split.title = title;
    if (description !== undefined) split.description = description;
    if (status) split.status = status;

    await split.save({ transaction });
    await transaction.commit();

    res.json({
      message: 'Expense split updated successfully',
      split
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Delete expense split
 * DELETE /api/splits/:id
 */
exports.deleteSplit = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.id;

    const split = await ExpenseShare.findByPk(id);

    if (!split) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Expense split not found' });
    }

    // Only creator can delete
    if (split.user_id !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Only the creator can delete this split' });
    }

    await split.destroy({ transaction });
    await transaction.commit();

    res.json({
      message: 'Expense split deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Mark member payment as settled
 * POST /api/splits/:id/settle
 */
exports.settleMemberPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { member_user_id, amount_paid } = req.body;
    const userId = req.user.id;

    const split = await ExpenseShare.findByPk(id, {
      include: [{
        model: ExpenseShareMember,
        as: 'members'
      }]
    });

    if (!split) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Expense split not found' });
    }

    // Only creator can settle payments
    if (split.user_id !== userId) {
      await transaction.rollback();
      return res.status(403).json({ error: 'Only the creator can settle payments' });
    }

    // Find member
    const member = await ExpenseShareMember.findOne({
      where: {
        share_id: id,
        user_id: member_user_id
      }
    });

    if (!member) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Member not found in this split' });
    }

    // Update amount paid
    member.amount_paid = parseFloat(member.amount_paid) + parseFloat(amount_paid);

    // Check if fully paid
    if (parseFloat(member.amount_paid) >= parseFloat(member.amount_owed)) {
      member.status = 'SETTLED';
    }

    await member.save({ transaction });

    // Check if all members are settled
    const allMembers = await ExpenseShareMember.findAll({
      where: { share_id: id }
    });

    const allSettled = allMembers.every(m => m.status === 'SETTLED');
    if (allSettled) {
      split.status = 'SETTLED';
      await split.save({ transaction });
    }

    await transaction.commit();

    res.json({
      message: 'Payment settled successfully',
      member
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Get debt summary for current user
 * GET /api/splits/summary
 */
exports.getDebtSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberSplits = await ExpenseShareMember.findAll({
      where: {
        user_id: userId,
        status: 'PENDING'
      },
      include: [{
        model: ExpenseShare,
        as: 'expenseShare',
        where: { status: 'ACTIVE' },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        }]
      }]
    });

    const summary = memberSplits.map(member => ({
      split_id: member.share_id,
      split_title: member.expenseShare.title,
      creator: member.expenseShare.creator,
      amount_owed: parseFloat(member.amount_owed),
      amount_paid: parseFloat(member.amount_paid),
      balance: parseFloat(member.amount_owed) - parseFloat(member.amount_paid)
    }));

    const totalBalance = summary.reduce((sum, item) => sum + item.balance, 0);

    res.json({
      summary,
      total_balance: totalBalance
    });
  } catch (error) {
    next(error);
  }
};

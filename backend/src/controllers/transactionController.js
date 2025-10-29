const { Transaction } = require('../models');

// Get all user transactions
exports.getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { user_id: req.userId },
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']]
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

// Get single transaction by ID
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

// Create new transaction (manual entry)
exports.createTransaction = async (req, res, next) => {
  try {
    const { description, amount, category, transaction_date } = req.body;

    // Validate required fields
    if (!description || !amount) {
      return res.status(400).json({
        error: 'Descripción y monto son obligatorios'
      });
    }

    const transaction = await Transaction.create({
      user_id: req.userId,
      description,
      amount,
      category: category || null,
      transaction_date: transaction_date || new Date()
    });

    res.status(201).json({
      message: 'Transacción creada exitosamente',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// Create multiple transactions (bulk insert for onboarding)
exports.createBulkTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        error: 'Debe proporcionar un array de transacciones'
      });
    }

    // Validate each transaction
    for (const t of transactions) {
      if (!t.description || !t.amount) {
        return res.status(400).json({
          error: 'Todas las transacciones deben tener descripción y monto'
        });
      }
    }

    // Add user_id to each transaction
    const transactionsToCreate = transactions.map(t => ({
      user_id: req.userId,
      description: t.description,
      amount: t.amount,
      category: t.category || null,
      transaction_date: t.transaction_date || new Date()
    }));

    const createdTransactions = await Transaction.bulkCreate(transactionsToCreate);

    res.status(201).json({
      message: `${createdTransactions.length} transacciones creadas exitosamente`,
      transactions: createdTransactions
    });
  } catch (error) {
    next(error);
  }
};

// Update transaction
exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount, category, transaction_date } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    // Update fields
    if (description !== undefined) transaction.description = description;
    if (amount !== undefined) transaction.amount = amount;
    if (category !== undefined) transaction.category = category;
    if (transaction_date !== undefined) transaction.transaction_date = transaction_date;

    await transaction.save();

    res.json({
      message: 'Transacción actualizada exitosamente',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    await transaction.destroy();

    res.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      where: { user_id: req.userId }
    });

    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Group by category
    const byCategory = transactions.reduce((acc, t) => {
      const cat = t.category || 'Sin categoría';
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0 };
      }
      acc[cat].count++;
      acc[cat].total += parseFloat(t.amount);
      return acc;
    }, {});

    res.json({
      total_transactions: totalTransactions,
      total_amount: totalAmount.toFixed(2),
      by_category: byCategory
    });
  } catch (error) {
    next(error);
  }
};

const { Transaction, ExpenseCategory } = require('../models');
const aiService = require('../services/aiService');
const { Op } = require('sequelize');

/**
 * Get monthly financial insight
 */
exports.getMonthlyInsight = async (req, res, next) => {
    try {
        const userId = req.userId; // Get userId from auth middleware

        // Get start and end of current month
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Fetch transactions
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId, // Use user_id (snake_case) as defined in the model
                transaction_date: {
                    [Op.between]: [firstDay, lastDay]
                }
            },
            limit: 50, // Limit to avoid token limits
            order: [['transaction_date', 'DESC']]
        });

        if (transactions.length === 0) {
            return res.json({
                insight: "¡Pilas! Aún no tienes gastos este mes. ¡Sigue así o empieza a registrar para que te acolite con consejos!"
            });
        }

        // Generate insight
        const insight = await aiService.generateFinancialInsight(transactions);

        res.json({
            insight,
            analyzedTransactions: transactions.length
        });

    } catch (error) {
        next(error);
    }
};

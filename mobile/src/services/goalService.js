import api, { handleResponse, handleError } from './api';

/**
 * Get all user goals
 */
export const getAllGoals = async () => {
  try {
    const response = await api.get('/goals');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get goal by ID
 */
export const getGoalById = async (goalId) => {
  try {
    const response = await api.get(`/goals/${goalId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Create new goal
 */
export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goals', goalData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update goal
 */
export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await api.put(`/goals/${goalId}`, goalData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete goal
 */
export const deleteGoal = async (goalId) => {
  try {
    const response = await api.delete(`/goals/${goalId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get goal progress
 */
export const getGoalProgress = async (goalId) => {
  try {
    const response = await api.get(`/goals/${goalId}/progress`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Create Kambio (register savings)
 */
export const createKambio = async (kambioData) => {
  try {
    const response = await api.post('/kambios', kambioData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get all kambios
 */
export const getAllKambios = async () => {
  try {
    const response = await api.get('/kambios');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get kambios by goal
 */
export const getKambiosByGoal = async (goalId) => {
  try {
    const response = await api.get(`/kambios/goal/${goalId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete kambio
 */
export const deleteKambio = async (kambioId) => {
  try {
    const response = await api.delete(`/kambios/${kambioId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get kambio statistics
 */
export const getKambioStats = async () => {
  try {
    const response = await api.get('/kambios/stats');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get kambios with monthly summaries
 * Aggregates kambios by month and returns both individual kambios and monthly totals
 */
export const getKambiosWithMonthlySummary = async () => {
  try {
    const kambios = await getAllKambios();

    if (!kambios || !Array.isArray(kambios.kambios)) {
      return {
        allKambios: [],
        monthlySummary: [],
        totalHistorical: 0,
        currentMonthTotal: 0,
      };
    }

    // Aggregate by month
    const monthlyMap = {};
    let totalHistorical = 0;

    kambios.kambios.forEach((kambio) => {
      const date = new Date(kambio.created_at);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const amount = parseFloat(kambio.amount) || 0;

      totalHistorical += amount;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          total: 0,
          count: 0,
          kambios: [],
        };
      }

      monthlyMap[monthKey].total += amount;
      monthlyMap[monthKey].count += 1;
      monthlyMap[monthKey].kambios.push(kambio);
    });

    // Convert to sorted array (newest first)
    const monthlySummary = Object.values(monthlyMap)
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((summary) => ({
        ...summary,
        total: parseFloat(summary.total.toFixed(2)),
      }));

    // Get current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthData = monthlyMap[currentMonth];
    const currentMonthTotal = currentMonthData ? currentMonthData.total : 0;

    return {
      allKambios: kambios.kambios,
      monthlySummary,
      totalHistorical: parseFloat(totalHistorical.toFixed(2)),
      currentMonthTotal: parseFloat(currentMonthTotal.toFixed(2)),
    };
  } catch (error) {
    handleError(error);
    return {
      allKambios: [],
      monthlySummary: [],
      totalHistorical: 0,
      currentMonthTotal: 0,
    };
  }
};

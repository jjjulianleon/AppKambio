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

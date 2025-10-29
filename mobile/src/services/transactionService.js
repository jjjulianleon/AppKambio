import api, { handleResponse, handleError } from './api';

/**
 * Get all user transactions
 */
export const getAllTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId) => {
  try {
    const response = await api.get(`/transactions/${transactionId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Create new transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Create bulk transactions
 */
export const createBulkTransactions = async (transactionsArray) => {
  try {
    const response = await api.post('/transactions/bulk', { transactions: transactionsArray });
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update transaction
 */
export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await api.put(`/transactions/${transactionId}`, transactionData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

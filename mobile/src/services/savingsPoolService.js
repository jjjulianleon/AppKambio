import api, { handleResponse, handleError } from './api';

/**
 * Get current savings pool data
 * Returns pool members, active requests, completed requests, and user's total savings
 */
export const getPoolData = async () => {
  try {
    const response = await api.get('/pools/current');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get pool members
 * Returns list of all members in the savings pool with their savings
 */
export const getPoolMembers = async () => {
  try {
    const response = await api.get('/pools/members');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get active requests
 * Returns all active funding requests in the pool
 */
export const getActiveRequests = async () => {
  try {
    const response = await api.get('/pools/requests/active');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get completed requests
 * Returns history of completed funding requests
 */
export const getCompletedRequests = async () => {
  try {
    const response = await api.get('/pools/requests/completed');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Create a new funding request
 * @param {Object} requestData - Request data
 * @param {number} requestData.amount - Amount requested
 * @param {string} requestData.description - Description/reason for the request
 */
export const createRequest = async (requestData) => {
  try {
    const response = await api.post('/pools/requests', {
      amount: requestData.amount,
      description: requestData.description
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Contribute to a funding request
 * @param {number} requestId - ID of the request to contribute to
 * @param {number} amount - Amount to contribute (optional, will be calculated proportionally if not provided)
 */
export const contributeToRequest = async (requestId, amount = null) => {
  try {
    const payload = { requestId };
    if (amount !== null) {
      payload.amount = amount;
    }
    
    const response = await api.post(`/pools/requests/${requestId}/contribute`, payload);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get request details
 * @param {number} requestId - ID of the request
 */
export const getRequestDetails = async (requestId) => {
  try {
    const response = await api.get(`/pools/requests/${requestId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get user's contribution history
 * Returns all contributions made by the current user
 */
export const getMyContributions = async () => {
  try {
    const response = await api.get('/pools/contributions/my');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get user's request history
 * Returns all requests made by the current user
 */
export const getMyRequests = async () => {
  try {
    const response = await api.get('/pools/requests/my');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Delete a request and refund all contributions
 * @param {number} requestId - ID of the request to delete
 */
export const deleteRequest = async (requestId) => {
  try {
    const response = await api.delete(`/pools/requests/${requestId}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

/**
 * Get user's available balance for contributions
 * Returns how much the user can contribute based on their current savings
 */
export const getAvailableBalance = async () => {
  try {
    const response = await api.get('/pools/balance/available');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Invite a user to join the savings pool
 * @param {Object} inviteData - Invite data
 * @param {string} inviteData.email - Email of the user to invite
 * @param {string} inviteData.name - Name of the user to invite
 */
export const inviteToPool = async (inviteData) => {
  try {
    const response = await api.post('/pools/invite', inviteData);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Get pool statistics
 * Returns aggregated statistics about the pool (total saved, total helped, etc.)
 */
export const getPoolStatistics = async () => {
  try {
    const response = await api.get('/pools/statistics');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Check if user can create a request
 * Returns validation about whether user meets requirements to create a request
 */
export const canCreateRequest = async () => {
  try {
    const response = await api.get('/pools/requests/can-create');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Calculate contribution amount for a request
 * Returns the calculated proportional contribution amount for the current user
 * @param {number} requestId - ID of the request
 */
export const calculateContribution = async (requestId) => {
  try {
    const response = await api.get(`/pools/requests/${requestId}/calculate-contribution`);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export default {
  getPoolData,
  getPoolMembers,
  getActiveRequests,
  getCompletedRequests,
  createRequest,
  contributeToRequest,
  getRequestDetails,
  getMyContributions,
  getMyRequests,
  deleteRequest,
  getAvailableBalance,
  inviteToPool,
  getPoolStatistics,
  canCreateRequest,
  calculateContribution
};

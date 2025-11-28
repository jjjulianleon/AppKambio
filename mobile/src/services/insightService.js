import axios from 'axios';
import { API_URL } from '../utils/constants';
import { getToken } from './authService';

/**
 * Get AI-generated financial insight
 * @returns {Promise<Object>} Insight data
 */
export const getInsight = async () => {
    try {
        const token = await getToken();
        const response = await axios.post(
            `${API_URL}/insights/analyze`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching insight:', error);
        throw error;
    }
};

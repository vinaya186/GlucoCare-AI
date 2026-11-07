/**
 * GlucoCare AI - Centralized API Service
 * Handles all communication with the FastAPI backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') 
  : '';

/**
 * Helper to execute fetch requests with unified JSON error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to GlucoCare AI backend. Please verify the FastAPI server is running on ' +
        (BASE_URL || 'http://localhost:8000')
      );
    }
    throw err;
  }
}

export const api = {
  /**
   * Health status check
   */
  async getHealth() {
    return request('/api/health');
  },

  /**
   * Fetch trained models comparison, confusion matrices, and feature importance
   */
  async getMetrics() {
    return request('/api/metrics');
  },

  /**
   * Submit 8 clinical features for diabetes risk estimation
   */
  async predict(assessmentData) {
    return request('/api/predict', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  },

  /**
   * Get anonymous assessment history
   */
  async getHistory(limit = 100) {
    return request(`/api/history?limit=${limit}`);
  },

  /**
   * Delete an individual assessment record
   */
  async deleteHistoryItem(id) {
    return request(`/api/history/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Clear all demo history
   */
  async clearAllHistory() {
    return request('/api/history', {
      method: 'DELETE',
    });
  },
};

export default api;

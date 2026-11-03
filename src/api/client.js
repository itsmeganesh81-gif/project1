// Centralized API client for BloodBridge
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bb_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // Clear expired token
      localStorage.removeItem('bb_token');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = data.detail || (typeof data === 'string' ? data : 'An API error occurred');
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    // If backend server is unreachable or offline, propagate with indicator
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error('BACKEND_OFFLINE');
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers }),
};


import axios from 'axios';

/**
 * Central Axios instance pointing to the Express backend.
 * All service files import from here — never create axios instances elsewhere.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request Interceptor: auto-attach JWT from localStorage ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloodlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: normalise error messages ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // Token expired → clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('bloodlink_token');
      localStorage.removeItem('bloodlink_user');
      // Only redirect if not already on the login/landing page
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

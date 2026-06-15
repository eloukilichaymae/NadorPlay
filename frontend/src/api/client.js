import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add bearer token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('np_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiry (401)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only fire auth_logout for protected routes, not for the login attempt itself
    const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('np_token');
      localStorage.removeItem('np_user');
      window.dispatchEvent(new Event('auth_logout'));
    }
    return Promise.reject(error);
  }
);

export default client;

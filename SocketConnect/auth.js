import apiClient from './apiClient';

// Auth utilities
const getToken = () => localStorage.getItem('auth_token');
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_user') || 'null');
  } catch {
    return null;
  }
};
const isAuthenticated = () => !!getToken();

const setAuth = (token, user) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// Auth functions using shared apiClient
const register = async (username, email, password) => {
  const response = await apiClient.post('/auth/register', { username, email, password });
  return response.data;
};

const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  setAuth(response.data.token, response.data.user);
  return response.data;
};

const logout = () => clearAuth();

const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Single export object
export const auth = {
  getToken,
  getUser,
  isAuthenticated,
  login,
  logout,
  register,
  getCurrentUser
};

export default apiClient;




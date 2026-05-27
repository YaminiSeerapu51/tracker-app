import axios from 'axios';
import { config } from './config';

// Token Management
class TokenManager {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  setToken(newToken) {
    this.token = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  clear() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export const tokenManager = new TokenManager();

// Authenticated API Client
class AuthenticatedAPIClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl.replace('/api', ''),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          tokenManager.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(username, email, password) {
    try {
      const response = await this.client.post('/auth/register', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  }

  async login(username, password) {
    try {
      const response = await this.client.post('/auth/login', {
        username,
        password
      });
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
        tokenManager.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  }

  async verifyToken() {
    try {
      const response = await this.client.post('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Token verification failed' };
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user info' };
    }
  }

  logout() {
    tokenManager.clear();
  }
}

export const authAPI = new AuthenticatedAPIClient();

// Convenience exports
export const setToken = (token) => tokenManager.setToken(token);
export const getToken = () => tokenManager.getToken();
export const setUser = (user) => tokenManager.setUser(user);
export const getUser = () => tokenManager.getUser();
export const isAuthenticated = () => tokenManager.isAuthenticated();
export const register = (username, email, password) => authAPI.register(username, email, password);
export const login = (username, password) => authAPI.login(username, password);
export const logout = () => authAPI.logout();
export const getCurrentUser = () => authAPI.getCurrentUser();

export default authAPI;


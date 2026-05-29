import axios from 'axios';
import { config } from './config';
import { auth } from './auth';

// Single shared axios instance
const apiClient = axios.create({
  baseURL: config.baseUrl
});

// Request interceptor - add token from single source of truth
apiClient.interceptors.request.use(
  config => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - centralized error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      auth.logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

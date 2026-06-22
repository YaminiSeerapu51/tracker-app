import axios from 'axios';
import { config } from './config';
import { emitSessionExpired } from './sessionEvents';

// Shared axios instance for all API calls
const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request.
// Read directly from localStorage to avoid a circular import with auth.js.
apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Handle expired/invalid sessions globally.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      emitSessionExpired('Your session has expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

// Normalize an axios/API error into a readable message.
export const getApiError = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

export default apiClient;

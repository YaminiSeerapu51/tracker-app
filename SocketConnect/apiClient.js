import axios from 'axios';
import { config } from './config';
import { auth } from './auth';

export const getApiError = (error, fallback = 'Something went wrong') => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
};

const apiClient = axios.create({
  baseURL: config.apiUrl
});

apiClient.interceptors.request.use((requestConfig) => {
  const token = auth.getToken();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      auth.logout();
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default apiClient;

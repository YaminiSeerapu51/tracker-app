import { config } from './config';
import apiClient from './apiClient';

// API functions using shared apiClient
export const getUserData = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const saveLocationHistory = async (locationData) => {
  const response = await apiClient.post('/locations', locationData);
  return response.data;
};

export const getLocationHistory = async (userId) => {
  const response = await apiClient.get(`/locations/${userId}`);
  return response.data;
};

export default apiClient;



import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// API functions for fetching data
export const getUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

export const saveLocationHistory = async (locationData) => {
  try {
    const response = await api.post('/locations', locationData);
    return response.data;
  } catch (error) {
    console.error('Error saving location history:', error);
    throw error;
  }
};

export const getLocationHistory = async (userId) => {
  try {
    const response = await api.get(`/locations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location history:', error);
    throw error;
  }
};

export default api;

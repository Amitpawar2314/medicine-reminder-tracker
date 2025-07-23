// client/src/services/trackingService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tracking'; // Adjust if your backend port is different

// Function to get the auth token from local storage
const getToken = () => localStorage.getItem('token');

// Create an instance of axios with the authorization header
const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all of today's tracking logs for the user
const getTodaysLogs = () => {
  return axios.get(`${API_URL}/today`, getAuthHeaders());
};

// Mark a medicine as taken
const logMedicineTaken = (logData) => {
  // logData should be an object like { medicineId, date, time }
  return axios.post(API_URL, logData, getAuthHeaders());
};

const trackingService = {
  getTodaysLogs,
  logMedicineTaken,
};

export default trackingService;
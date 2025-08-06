// client/src/services/medicineService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/medicines'; // Adjust if your backend port is different

// Function to get the auth token from local storage
const getToken = () => localStorage.getItem('token');

// Create an instance of axios with the authorization header
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {}; // Return empty object if no token
  return {
    headers: {
      // The "Bearer " prefix is crucial
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all medicines for the logged-in user
const getMedicines = () => {
  return axios.get(API_URL, getAuthHeaders());
};

// Add a new medicine
const addMedicine = (medicineData) => {
  return axios.post(API_URL, medicineData, getAuthHeaders());
};

const medicineService = {
  getMedicines,
  addMedicine,
};

export default medicineService;
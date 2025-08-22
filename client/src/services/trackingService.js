// client/src/services/trackingService.js
import axios from 'axios';

// The base URL for tracking logs, as defined by our backend routes
// const API_URL = 'http://localhost:5000/api/medicines/medicinelogs';
const API_URL = '${import.meta.env.VITE_API_URL}/api/medicines';

// Function to get the auth token from local storage
const getToken = () => localStorage.getItem('token');

// Create a headers object with the authorization header
const getAuthHeaders = () => {
    const token = getToken();
    if (!token) return {}; // Returns an empty object if there's no token
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Get all of today's tracking logs for the user
const getTodaysLogs = () => {
    const today = new Date().toISOString().split('T')[0]; // Format today's date as YYYY-MM-DD
    return axios.get(`${API_URL}?date=${today}`, getAuthHeaders());
};

// Mark a medicine as taken or missed
const logMedicineStatus = (logData) => {
    // logData should be an object like { medicineId, date, scheduledTime, status }
    return axios.post(API_URL, logData, getAuthHeaders());
};

const trackingService = {
    getTodaysLogs,
    logMedicineStatus,
};

export default trackingService;
console.log("VITE_API_URL is:", import.meta.env.VITE_API_URL);
import axios from 'axios';

// This is the correct API endpoint for medicine CRUD operations
// const API_URL = 'http://localhost:5000/api/medicines';
const API_URL = '${import.meta.env.VITE_API_URL}/api/medicines';

const getMedicines = (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return axios.get(API_URL, config);
};

const addMedicine = (medicineData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    return axios.post(API_URL, medicineData, config);
};

const medicineService = {
    getMedicines,
    addMedicine,
};

export default medicineService;
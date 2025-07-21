// client/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import medicineService from '../services/medicineService';
import AddMedicineForm from '../components/AddMedicineForm';

const Dashboard = () => {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState('');

  // Use useCallback to prevent re-creating the function on every render
  const fetchMedicines = useCallback(async () => {
    try {
      const response = await medicineService.getMedicines();
      setMedicines(response.data);
    } catch (err) {
      setError('Failed to fetch medicines.');
      console.error(err);
    }
  }, []);

  // useEffect hook to fetch medicines when the component mounts
  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return (
    <div>
      <h2>Your Medicine Dashboard</h2>
      <hr />
      <AddMedicineForm onMedicineAdded={fetchMedicines} />
      <hr />
      <h3>Your Current Medicines</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {medicines.length > 0 ? (
        <ul>
          {medicines.map((med) => (
            <li key={med._id}>
              <strong>{med.name}</strong> ({med.dosage}) -
              Schedule: {med.schedule.join(', ') || 'Not set'}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not added any medicines yet.</p>
      )}
    </div>
  );
};

export default Dashboard;
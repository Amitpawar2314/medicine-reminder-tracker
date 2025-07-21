// client/src/components/AddMedicineForm.jsx
import React, { useState } from 'react';
import medicineService from '../services/medicineService';

// The onMedicineAdded prop is a function passed from the Dashboard to refresh the list
const AddMedicineForm = ({ onMedicineAdded }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState(['']); // Start with one empty time input
  const [error, setError] = useState('');

  const handleScheduleChange = (index, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = value;
    setSchedule(newSchedule);
  };

  const addScheduleTime = () => {
    setSchedule([...schedule, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const medicineData = { name, dosage, schedule: schedule.filter(time => time) };
      await medicineService.addMedicine(medicineData);
      // Clear the form
      setName('');
      setDosage('');
      setSchedule(['']);
      // Notify the parent component to refresh the medicine list
      onMedicineAdded();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add medicine');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add New Medicine</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Dosage (e.g., "1 pill"):</label>
        <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
      </div>
      <div>
        <label>Schedule Times:</label>
        {schedule.map((time, index) => (
          <input
            key={index}
            type="time"
            value={time}
            onChange={(e) => handleScheduleChange(index, e.target.value)}
          />
        ))}
        <button type="button" onClick={addScheduleTime}>+ Add Time</button>
      </div>
      <button type="submit">Add Medicine</button>
    </form>
  );
};

export default AddMedicineForm;
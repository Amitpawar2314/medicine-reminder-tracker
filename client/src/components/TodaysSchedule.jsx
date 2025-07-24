// client/src/components/TodaysSchedule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import trackingService from '../services/trackingService';
import { format } from 'date-fns'; // You may need to install this: npm install date-fns

// This component receives the list of all medicines as a prop
const TodaysSchedule = ({ allMedicines }) => {
  const [todaysLogs, setTodaysLogs] = useState([]);
  const [todaysMedicines, setTodaysMedicines] = useState([]);
  const [error, setError] = useState('');

  const fetchTodaysLogs = useCallback(async () => {
    try {
      const response = await trackingService.getTodaysLogs();
      setTodaysLogs(response.data);
    } catch (err) {
      setError('Could not fetch today\'s schedule.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch when component mounts
    fetchTodaysLogs();

    // Filter all medicines to find which ones are scheduled for today
    const todayStr = format(new Date(), 'EEEE').toLowerCase(); // e.g., "monday"
    const scheduledToday = allMedicines
      .flatMap(med => med.schedule.map(time => ({ ...med, scheduledTime: time })))
      // This is a simple filter; your app might have more complex logic
      // For now, we assume all medicines are for all days. A better schema would have day info.
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    setTodaysMedicines(scheduledToday);
  }, [allMedicines, fetchTodaysLogs]);

  const handleTakeMedicine = async (medicineId, time) => {
    try {
      const logData = {
        medicineId,
        date: format(new Date(), 'yyyy-MM-dd'),
        time,
      };
      await trackingService.logMedicineTaken(logData);
      // Refresh the logs to update the UI instantly
      fetchTodaysLogs();
    } catch (err) {
      console.error('Failed to log medicine', err);
      alert('Could not mark medicine as taken.');
    }
  };

  // Function to check if a specific dose has been logged as 'taken'
  const isTaken = (medicineId, time) => {
    return todaysLogs.some(
      log => log.medicine === medicineId && log.time === time && log.status === 'taken'
    );
  };

  return (
    <div>
      <h3>Today's Schedule</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {todaysMedicines.length > 0 ? (
        <ul>
          {todaysMedicines.map((med, index) => (
            <li key={`${med._id}-${index}`}>
              <span>{med.scheduledTime} - {med.name} ({med.dosage})</span>
              {isTaken(med._id, med.scheduledTime) ? (
                <span style={{ marginLeft: '10px', color: 'green' }}>✔ Taken</span>
              ) : (
                <button 
                  onClick={() => handleTakeMedicine(med._id, med.scheduledTime)}
                  style={{ marginLeft: '10px' }}
                >
                  Take
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No medicines scheduled for today.</p>
      )}
    </div>
  );
};

export default TodaysSchedule;
// client/src/components/TodaysSchedule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import trackingService from '../services/trackingService';
import { format, isToday, parseISO } from 'date-fns'; // Make sure to 'npm install date-fns'

const TodaysSchedule = ({ allMedicines }) => {
    const [todaysLogs, setTodaysLogs] = useState([]);
    const [todaysScheduledDoses, setTodaysScheduledDoses] = useState([]);
    const [error, setError] = useState('');
    const [loadingLogs, setLoadingLogs] = useState(true);

    // Function to fetch today's tracking logs
    const fetchTodaysLogs = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing for schedule.');
            setLoadingLogs(false);
            return;
        }
        try {
            setLoadingLogs(true);
            const response = await trackingService.getTodaysLogs(token); // Pass token
            setTodaysLogs(response.data);
            setError('');
        } catch (err) {
            setError('Could not fetch today\'s schedule.');
            console.error('Error fetching today\'s logs:', err);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    // Effect to fetch logs when component mounts or dependencies change
    useEffect(() => {
        fetchTodaysLogs();
    }, [fetchTodaysLogs]);

    // Effect to determine today's scheduled medicines based on allMedicines and current date
    useEffect(() => {
        const today = new Date();
        const scheduled = [];

        allMedicines.forEach(med => {
            // Check if medicine is active and its start date is today or in the past
            const medStartDate = med.startDate ? parseISO(med.startDate) : null;
            const medEndDate = med.endDate ? parseISO(med.endDate) : null;

            const isMedActiveToday = med.isActive &&
                                     (!medStartDate || medStartDate <= today) &&
                                     (!medEndDate || medEndDate >= today);

            if (isMedActiveToday && med.times && med.times.length > 0) {
                med.times.forEach(time => {
                    scheduled.push({
                        _id: med._id, // Medicine ID
                        name: med.name,
                        dosage: med.dosage,
                        scheduledTime: time, // The specific time for this dose
                        // Add other relevant medicine details if needed
                    });
                });
            }
        });

        // Sort scheduled doses by time
        scheduled.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
        setTodaysScheduledDoses(scheduled);
    }, [allMedicines]); // Re-run if allMedicines changes

    // Handler for marking medicine as taken
    const handleMarkMedicineStatus = async (medicineId, scheduledTime, status) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing. Please log in again.');
            return;
        }

        try {
            const logData = {
                medicineId,
                date: format(new Date(), 'yyyy-MM-dd'), // Format as YYYY-MM-DD
                scheduledTime,
                status,
            };
            await trackingService.logMedicineStatus(logData, token); // Pass token
            fetchTodaysLogs(); // Refresh logs to update UI
        } catch (err) {
            setError('Could not mark medicine status.');
            console.error('Failed to log medicine status:', err);
        }
    };

    // Function to check the status of a specific dose
    const getDoseStatus = (medicineId, scheduledTime) => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const log = todaysLogs.find(
            log =>
                log.medicineId === medicineId &&
                format(new Date(log.date), 'yyyy-MM-dd') === todayStr && // Compare normalized dates
                log.scheduledTime === scheduledTime
        );
        return log ? log.status : 'scheduled'; // Default to 'scheduled' if no log entry
    };

    if (loadingLogs) {
        return <div style={{ textAlign: 'center', marginTop: '1rem' }}>Loading today's schedule...</div>;
    }

    return (
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>Today's Schedule</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {todaysScheduledDoses.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {todaysScheduledDoses.map((dose, index) => {
                        const status = getDoseStatus(dose._id, dose.scheduledTime);
                        return (
                            <li key={`${dose._id}-${dose.scheduledTime}-${index}`} style={{ marginBottom: '0.5rem' }}>
                                <span>
                                    {dose.scheduledTime} - <strong>{dose.name}</strong> ({dose.dosage})
                                </span>
                                {status === 'taken' ? (
                                    <span style={{ marginLeft: '10px', color: 'green', fontWeight: 'bold' }}>✔ Taken</span>
                                ) : status === 'missed' ? (
                                    <span style={{ marginLeft: '10px', color: 'orange', fontWeight: 'bold' }}>✗ Missed</span>
                                ) : (
                                    <span style={{ marginLeft: '10px' }}>
                                        <button
                                            onClick={() => handleMarkMedicineStatus(dose._id, dose.scheduledTime, 'taken')}
                                            style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                                        >
                                            Mark Taken
                                        </button>
                                        <button
                                            onClick={() => handleMarkMedicineStatus(dose._id, dose.scheduledTime, 'missed')}
                                            style={{ padding: '5px 10px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Mark Missed
                                        </button>
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p>No medicines scheduled for today.</p>
            )}
        </div>
    );
};

export default TodaysSchedule;
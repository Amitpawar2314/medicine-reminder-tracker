// client/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import medicineService from '../services/medicineService';
import AddMedicineForm from '../components/AddMedicineForm';
import TodaysSchedule from '../components/TodaysSchedule';

const Dashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchMedicines = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('No token, authorization denied.');
            setLoading(false);
            navigate('/login'); 
            return;
        }
        
        try {
            setLoading(true);
            const response = await medicineService.getMedicines(token);
            setMedicines(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch medicines. Please log in again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchMedicines();
    }, [fetchMedicines]);

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading medicines...</div>;
    }
    
    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Your Medicine Dashboard</h2>
                <button 
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                    style={{ padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Logout
                </button>
            </div>
            
            {error && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{error}</p>}
            
            <TodaysSchedule allMedicines={medicines} />
            
            <hr style={{ margin: '2rem 0' }} />
            
            <AddMedicineForm onMedicineAdded={fetchMedicines} />
            
            <hr style={{ margin: '2rem 0' }} />
            
            <h3>Your Current Medicines</h3>
            {medicines.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {medicines.map((med) => (
                        <li key={med._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                            <strong>{med.name}</strong> ({med.dosage})<br />
                            <small>
                                Schedule: {med.times && med.times.length > 0 ? med.times.join(', ') : 'Not set'}
                            </small>
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
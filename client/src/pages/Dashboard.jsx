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
        return <div className="container" style={{ textAlign: 'center' }}>Loading medicines...</div>;
    }
    
    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Your Medicine Dashboard</h2>
                <button 
                    onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                    className="btn-danger"
                >
                    Logout
                </button>
            </div>
            
            {error && <p className="text-error" style={{ marginBottom: '1rem' }}>{error}</p>}
            
            <div className="card">
                <TodaysSchedule allMedicines={medicines} />
            </div>
            
            <div className="card">
                <AddMedicineForm onMedicineAdded={fetchMedicines} />
            </div>
            
            <h3>Your Current Medicines</h3>
            {medicines.length > 0 ? (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {medicines.map((med) => (
                        <li key={med._id} className="card" style={{ padding: '1rem' }}>
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
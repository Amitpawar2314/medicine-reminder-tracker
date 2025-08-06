import React, { useState } from 'react';
import medicineService from '../services/medicineService';

// The onMedicineAdded prop is a function passed from the Dashboard to refresh the list
const AddMedicineForm = ({ onMedicineAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: '',
        times: [''], // Use 'times' to match the backend schema
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { name, dosage, frequency, times, notes } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setFormData({ ...formData, times: newTimes });
    };

    const addTimeField = () => {
        setFormData({ ...formData, times: [...times, ''] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please log in to add a medicine.');
            setLoading(false);
            return;
        }

        const medicineData = {
            ...formData,
            times: formData.times.filter(time => time) // Filter out any empty time strings
        };

        try {
            await medicineService.addMedicine(medicineData, token);
            setFormData({ name: '', dosage: '', frequency: '', times: [''], notes: '' });
            onMedicineAdded();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add medicine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <h3>Add New Medicine</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="text" name="dosage" value={dosage} onChange={onChange} placeholder="Dosage" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                <input type="text" name="frequency" value={frequency} onChange={onChange} placeholder="Frequency" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                
                {times.map((time, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} style={{ flexGrow: 1, padding: '8px' }} />
                        {index === times.length - 1 && (
                            <button type="button" onClick={addTimeField} style={{ marginLeft: '10px', padding: '8px 12px' }}>
                                + Add Time
                            </button>
                        )}
                    </div>
                ))}
                
                <textarea name="notes" value={notes} onChange={onChange} placeholder="Notes" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                    {loading ? 'Adding...' : 'Add Medicine'}
                </button>
            </form>
        </div>
    );
};

export default AddMedicineForm;
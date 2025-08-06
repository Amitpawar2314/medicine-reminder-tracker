const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medicine = require('../models/Medicine');
const MedicineLog = require('../models/MedicineLog');

// @route   POST /api/medicines
// @desc    Add new medicine
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, dosage, frequency, times, startDate, endDate, notes, isActive } = req.body;
    try {
        const newMedicine = new Medicine({
            userId: req.user.id,
            name,
            dosage,
            frequency,
            times,
            startDate,
            endDate,
            notes,
            isActive
        });
        const medicine = await newMedicine.save();
        res.status(201).json(medicine);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/medicines
// @desc    Get all medicines for a single user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Fetch all medicines that belong to the authenticated user
        const medicines = await Medicine.find({ userId: req.user.id });
        res.status(200).json(medicines);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/medicines/:id
// @desc    Update a medicine by ID
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, dosage, frequency, times, startDate, endDate, notes, isActive } = req.body;
    const medicineFields = {};
    if (name) medicineFields.name = name;
    if (dosage) medicineFields.dosage = dosage;
    if (frequency) medicineFields.frequency = frequency;
    if (times) medicineFields.times = times;
    if (startDate) medicineFields.startDate = startDate;
    if (endDate) medicineFields.endDate = endDate;
    if (notes) medicineFields.notes = notes;
    if (isActive !== undefined) medicineFields.isActive = isActive;

    try {
        let medicine = await Medicine.findOne({ _id: req.params.id, userId: req.user.id });
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found or user not authorized' });
        }
        medicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            { $set: medicineFields },
            { new: true, runValidators: true }
        );
        res.json(medicine);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Medicine ID format' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found or user not authorized' });
        }
        res.json({ msg: 'Medicine deleted successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Medicine ID format' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/medicines/medicinelogs
// @desc    Mark a medicine as taken/missed for a specific scheduled time on a given date
// @access  Private
router.post('/medicinelogs', auth, async (req, res) => {
    const { medicineId, date, scheduledTime, status, notes } = req.body;
    if (!medicineId || !date || !scheduledTime || !status) {
        return res.status(400).json({ msg: 'Please provide medicineId, date, scheduledTime, and status' });
    }
    try {
        const logDate = new Date(date);
        logDate.setUTCHours(0, 0, 0, 0);

        let logEntry = await MedicineLog.findOne({
            userId: req.user.id,
            medicineId,
            date: logDate,
            scheduledTime
        });

        if (logEntry) {
            logEntry.status = status;
            if (status === 'taken') {
                logEntry.takenAt = new Date();
            } else {
                logEntry.takenAt = undefined;
            }
            logEntry.notes = notes;
        } else {
            const medicine = await Medicine.findOne({ _id: medicineId, userId: req.user.id });
            if (!medicine) {
                return res.status(404).json({ msg: 'Medicine not found or user not authorized' });
            }
            logEntry = new MedicineLog({
                userId: req.user.id,
                medicineId,
                date: logDate,
                scheduledTime,
                status,
                takenAt: status === 'taken' ? new Date() : undefined,
                notes
            });
        }
        await logEntry.save();
        res.status(200).json(logEntry);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Duplicate log entry: This medicine is already logged for this time and date.' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/medicines/medicinelogs
// @desc    Get all medicine log entries for the authenticated user, optionally filtered by date range
// @access  Private
router.get('/medicinelogs', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.user.id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const startOfDay = new Date(startDate);
                startOfDay.setUTCHours(0, 0, 0, 0);
                query.date.$gte = startOfDay;
            }
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                query.date.$lte = endOfDay;
            }
        }
        const logs = await MedicineLog.find(query)
            .populate('medicineId', 'name dosage times')
            .sort({ date: -1, scheduledTime: -1 });

        const validLogs = logs.filter(log => log.medicineId !== null);
        res.json(validLogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
// server/routes/medicineRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import our authentication middleware
const Medicine = require('../models/Medicine'); // Import the Medicine model

// @route   POST /api/medicines
// @desc    Add new medicine
// @access  Private (requires authentication token)
router.post('/', auth, async (req, res) => {
    // Extract medicine details from the request body
    const { name, dosage, frequency, times, startDate, endDate, notes, isActive } = req.body;

    try {
        // req.user.id comes from the auth middleware, which extracts it from the JWT
        const newMedicine = new Medicine({
            userId: req.user.id, // Associate the medicine with the authenticated user
            name,
            dosage,
            frequency,
            times,
            startDate,
            endDate,
            notes,
            isActive
        });

        const medicine = await newMedicine.save(); // Save the new medicine to the database
        res.status(201).json(medicine); // Respond with the created medicine and 201 Created status

    } catch (err) {
        console.error(err.message);
        // Check for specific validation errors (e.g., if 'name' is missing)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
// server/models/Medicine.js
const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    // Link to the User who owns this medicine
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true // Remove whitespace from both ends of a string
    },
    dosage: {
        type: String,
        trim: true
    },
    frequency: {
        type: String, // e.g., "Daily", "Twice a day", "Every X hours"
        trim: true
    },
    times: [{ // Array of strings for specific times, e.g., ["08:00", "20:00"]
        type: String,
        trim: true
    }],
    startDate: {
        type: Date,
        default: Date.now // Defaults to the current date when created
    },
    endDate: {
        type: Date,
        required: false // Optional
    },
    notes: {
        type: String,
        required: false, // Optional
        maxlength: 500 // Example: limit notes to 500 characters
    },
    isActive: { // To easily disable a medicine without deleting it
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Mongoose automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Medicine', MedicineSchema);
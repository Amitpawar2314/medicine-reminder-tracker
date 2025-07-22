const mongoose = require('mongoose');

const MedicineLogSchema = new mongoose.Schema({
    userId: { // The user who owns this log entry
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true
    },
    medicineId: { // The specific medicine this log entry is for
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    date: { // The specific date for this log entry (e.g., '2025-07-22')
        type: Date,
        required: true
    },
    scheduledTime: { // The time the medicine was scheduled for that day (e.g., "08:00")
        type: String,
        required: true
    },
    status: { // Current status: 'scheduled', 'taken', 'missed'
        type: String,
        enum: ['scheduled', 'taken', 'missed'], // Enforce specific values
        default: 'scheduled'
    },
    takenAt: { // Optional: Actual time the medicine was marked as taken
        type: Date,
        required: false // Only required if status is 'taken'
    },
    notes: { // Optional notes for this specific log entry
        type: String,
        required: false,
        maxlength: 200
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Optional: Add a compound unique index to prevent duplicate log entries for the same user, medicine, date, and scheduled time
MedicineLogSchema.index({ userId: 1, medicineId: 1, date: 1, scheduledTime: 1 }, { unique: true });

module.exports = mongoose.model('MedicineLog', MedicineLogSchema);
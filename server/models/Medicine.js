// server/models/Medicine.js

const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide the medicine name'],
    trim: true,
  },
  dosage: {
    type: String,
    required: [true, 'Please provide the dosage'],
  },
  schedule: {
    // This will store an array of times, e.g., ["08:00", "14:00", "20:00"]
    type: [String], 
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);
const express = require('express');
const dotenv = require('dotenv').config(); // Load .env variables at the very start
const connectDB = require('./config/db'); // Import our DB connection function
const cors = require('cors'); // Import cors middleware

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware - Order matters here!
app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: false })); // For parsing URL-encoded form data
app.use(cors()); // Enable CORS for all routes (important for frontend communication)

// Define API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));

// Define a simple root route to check if server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Ensure MONGO_URI is loaded from .env
        // dotenv.config() needs to be called in server.js before this module is loaded
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI is not defined in .env file.');
            console.error('Please ensure your .env file exists in the server directory and contains MONGO_URI.');
            process.exit(1); // Exit process with failure
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For comparing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const User = require('../models/User'); // Import the User model
const { loginUser } = require('../controllers/auth.js');

// @route   POST /api/auth/register
// @desc    Register new user (This part should be implemented by Teammate B, or you can add it if it's not done yet)
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user instance
        user = new User({
            username,
            email,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create and sign JWT
        const payload = {
            user: {
                id: user.id // MongoDB's _id is accessible as .id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token }); // Send token back to client
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. If credentials match, create JWT payload
        const payload = {
            user: {
                id: user.id // Mongoose provides .id as a string version of _id
            }
        };

        // 4. Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret from .env
            { expiresIn: '1h' }, // Token expiration (e.g., 1 hour)
            (err, token) => {
                if (err) throw err;
                res.json({ token }); // Send the token back to the client
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
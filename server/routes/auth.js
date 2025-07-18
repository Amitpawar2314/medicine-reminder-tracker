// server/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Import your User model

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check for existing user by email or username
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: 'User with this email or username already exists.' });
    }

    // Create a new user instance
    user = new User({
      username,
      email,
      password,
    });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to MongoDB
    await user.save();

    // Send back a success response (don't include the password!)
    res.status(201).json({
      msg: 'User registered successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
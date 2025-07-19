// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// This middleware will be used on routes that require authentication
module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Common practice to send token in x-auth-token header

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Attach decoded user (containing user ID) to the request object
        next(); // Move to the next middleware/route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
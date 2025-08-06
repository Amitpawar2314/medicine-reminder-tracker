// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// This middleware will be used on routes that require authentication
module.exports = function(req, res, next) {
    // Get token from the Authorization header (standard practice with axios)
    let token = req.header('Authorization');

    if (token) {
        // If an Authorization header exists, extract the token from the "Bearer <token>" string
        token = token.replace('Bearer ', '');
    } else {
        // As a fallback, check for the token in the x-auth-token header
        token = req.header('x-auth-token');
    }

    // Check if no token was found in either header
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
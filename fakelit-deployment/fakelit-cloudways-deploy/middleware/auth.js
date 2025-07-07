const jwt = require('jsonwebtoken');
const { userService } = require('../config/supabase');

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userService.findUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Optional authentication middleware - allows requests to proceed with or without auth
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const user = await userService.findUserById(decoded.userId);
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we continue without authentication
                console.log('Optional auth: Invalid token, continuing without auth');
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        await authenticateToken(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        return res.status(403).json({ error: 'Access denied' });
    }
};

// Middleware to check if user is client
const requireClient = async (req, res, next) => {
    try {
        await authenticateToken(req, res, () => {
            if (req.user.role !== 'client') {
                return res.status(403).json({ error: 'Client access required' });
            }
            next();
        });
    } catch (error) {
        return res.status(403).json({ error: 'Access denied' });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireClient
}; 
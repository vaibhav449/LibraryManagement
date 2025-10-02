const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user still exists
            const currentUser = await User.findById(decoded.id).select('-password');
            if (!currentUser) {
                return res.status(401).json({ 
                    message: 'The user belonging to this token no longer exists' 
                });
            }
            
            // Grant access to protected route
            req.user = currentUser;
            next();
            
        } catch (error) {
            console.error('Token verification error:', error.message);
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            } else {
                return res.status(401).json({ message: 'Token verification failed' });
            }
        }
    } else {
        return res.status(401).json({ 
            message: 'Access denied. No token provided or invalid format' 
        });
    }
};

// Middleware to authorize specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. Please authenticate first' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
            });
        }
        next();
    };
};

// Middleware to ensure user can only access their own resources
exports.authorizeSelf = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Access denied. Please authenticate first' });
    }
    
    const requestedUserId = req.params.id;
    
    // Validate that the requested user ID is a valid MongoDB ObjectId
    if (!requestedUserId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    if (req.user.id !== requestedUserId) {
        return res.status(403).json({ 
            message: 'Access denied. You can only access your own resources' 
        });
    }
    next();
};

// Middleware to validate JWT structure without verification (for logout scenarios)
exports.validateTokenStructure = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ 
            message: 'Invalid authorization header format' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token.split('.').length !== 3) {
        return res.status(400).json({ 
            message: 'Invalid token structure' 
        });
    }
    
    req.token = token;
    next();
};

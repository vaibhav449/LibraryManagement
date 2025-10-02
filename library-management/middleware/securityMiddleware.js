const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Rate limiting configurations
const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many accounts created from this IP, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs for sensitive operations
    message: {
        message: 'Too many requests for this operation, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Custom XSS protection middleware (since xss-clean is deprecated)
const xssProtection = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // Remove script tags and javascript: protocols
            return value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
                .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
        }
        return value;
    };

    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        sanitizeObject(obj[key]);
                    } else {
                        obj[key] = sanitizeValue(obj[key]);
                    }
                }
            }
        }
    };

    if (req.body) {
        sanitizeObject(req.body);
    }
    if (req.query) {
        sanitizeObject(req.query);
    }
    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};

// Content Security Policy configuration
const cspOptions = {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
    },
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Trim whitespace from all string inputs
    const trimStrings = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'string') {
                        obj[key] = obj[key].trim();
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        trimStrings(obj[key]);
                    }
                }
            }
        }
    };

    if (req.body) trimStrings(req.body);
    if (req.query) trimStrings(req.query);
    if (req.params) trimStrings(req.params);

    next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
        return res.status(413).json({
            message: 'Request entity too large. Maximum allowed size is 1MB.'
        });
    }
    next();
};

module.exports = {
    // Rate limiters
    createAccountLimiter,
    loginLimiter,
    generalLimiter,
    strictLimiter,
    
    // Security middleware
    helmet: helmet({
        contentSecurityPolicy: cspOptions,
        crossOriginEmbedderPolicy: false
    }),
    mongoSanitize: mongoSanitize({
        allowDots: true,
        replaceWith: '_'
    }),
    hpp: hpp({
        whitelist: ['sort', 'fields', 'page', 'limit', 'title', 'genre', 'author']
    }),
    
    // Custom middleware
    xssProtection,
    sanitizeInput,
    securityHeaders,
    requestSizeLimiter
};
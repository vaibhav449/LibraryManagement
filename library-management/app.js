require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { swaggerUi, specs } = require('./config/swagger');

const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const readRoutes = require('./routes/readerRoutes');

// Import security middleware
const {
    helmet,
    mongoSanitize,
    hpp,
    xssProtection,
    sanitizeInput,
    securityHeaders,
    requestSizeLimiter,
    generalLimiter
} = require('./middleware/securityMiddleware');

const app = express();

// Connect to database
connectDB()


// Security middleware (apply before other middleware)

app.use(securityHeaders);
app.use(helmet);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Rate limiting
app.use(generalLimiter);

// Request size limiting
app.use(requestSizeLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Input sanitization
app.use(mongoSanitize);
app.use(hpp);
app.use(xssProtection);
app.use(sanitizeInput);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Library Management API Documentation'
}));

// Root route with API info
app.get('/', (req, res) => {
    res.json({
        message: 'Library Management System API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            users: '/users',
            books: '/books',
            reader: '/reader'
        }
    });
});

// Routes
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/reader', readRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            message: 'Validation Error',
            errors
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field} already exists`
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Token expired'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

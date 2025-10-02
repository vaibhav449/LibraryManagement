const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Common validation rules
const validateObjectId = (field) => {
    return param(field)
        .isMongoId()
        .withMessage(`Invalid ${field} format`)
        .customSanitizer(value => value.trim());
};

const validateEmail = (field = 'email') => {
    return body(field)
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters');
};

const validatePassword = (field = 'password') => {
    return body(field)
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .customSanitizer(value => value.trim());
};

const validateName = (field = 'name') => {
    return body(field)
        .isLength({ min: 2, max: 50 })
        .withMessage(`${field} must be between 2 and 50 characters`)
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage(`${field} can only contain letters and spaces`)
        .customSanitizer(value => value.trim());
};

const validateRole = () => {
    return body('role')
        .isIn(['Reader', 'Author'])
        .withMessage('Role must be either Reader or Author')
        .customSanitizer(value => value.trim());
};

const validateTitle = () => {
    return body('title')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .matches(/^[a-zA-Z0-9\s\-_.,:;!?'"()]+$/)
        .withMessage('Title contains invalid characters')
        .customSanitizer(value => value.trim());
};

const validateGenre = () => {
    return body('genre')
        .isLength({ min: 2, max: 50 })
        .withMessage('Genre must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-&]+$/)
        .withMessage('Genre can only contain letters, spaces, hyphens, and ampersands')
        .customSanitizer(value => value.trim());
};

const validateStock = () => {
    return body('stock')
        .isInt({ min: 0, max: 10000 })
        .withMessage('Stock must be a non-negative integer not exceeding 10000')
        .toInt();
};

// Query parameter validations
const validateSearchQuery = (field) => {
    return query(field)
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage(`${field} search term must be between 1 and 100 characters`)
        .matches(/^[a-zA-Z0-9\s\-_.]+$/)
        .withMessage(`${field} search term contains invalid characters`)
        .customSanitizer(value => value ? value.trim() : value);
};

// User validation schemas
const userSignupValidation = [
    validateName(),
    validateEmail(),
    validatePassword(),
    validateRole(),
    handleValidationErrors
];

const userLoginValidation = [
    validateEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .customSanitizer(value => value.trim()),
    handleValidationErrors
];

const userUpdateValidation = [
    validateObjectId('id'),
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces')
        .customSanitizer(value => value ? value.trim() : value),
    body('password')
        .optional()
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
        .customSanitizer(value => value ? value.trim() : value),
    handleValidationErrors
];

const userDeleteValidation = [
    validateObjectId('id'),
    handleValidationErrors
];

// Book validation schemas
const bookCreateValidation = [
    validateTitle(),
    validateGenre(),
    validateStock(),
    handleValidationErrors
];

const bookUpdateValidation = [
    validateObjectId('id'),
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .matches(/^[a-zA-Z0-9\s\-_.,:;!?'"()]+$/)
        .withMessage('Title contains invalid characters')
        .customSanitizer(value => value ? value.trim() : value),
    body('genre')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Genre must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\-&]+$/)
        .withMessage('Genre can only contain letters, spaces, hyphens, and ampersands')
        .customSanitizer(value => value ? value.trim() : value),
    body('stock')
        .optional()
        .isInt({ min: 0, max: 10000 })
        .withMessage('Stock must be a non-negative integer not exceeding 10000')
        .toInt(),
    handleValidationErrors
];

const bookSearchValidation = [
    validateSearchQuery('title'),
    validateSearchQuery('genre'),
    query('author')
        .optional()
        .isMongoId()
        .withMessage('Invalid author ID format'),
    handleValidationErrors
];

const bookDeleteValidation = [
    validateObjectId('id'),
    handleValidationErrors
];

const getBooksByAuthorValidation = [
    validateObjectId('id'),
    handleValidationErrors
];

// Reader validation schemas
const readerProfileValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces')
        .customSanitizer(value => value ? value.trim() : value),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('Email must not exceed 100 characters'),
    handleValidationErrors
];

const borrowReturnBookValidation = [
    body('bookId')
        .isMongoId()
        .withMessage('Invalid book ID format')
        .customSanitizer(value => value.trim()),
    handleValidationErrors
];

const getBorrowedBooksValidation = [
    validateObjectId('id'),
    handleValidationErrors
];

// JWT Token validation
const validateAuthHeader = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is required' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header must start with "Bearer "' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token || token.length === 0) {
        return res.status(401).json({ message: 'Token is required' });
    }
    
    next();
};

module.exports = {
    // User validations
    userSignupValidation,
    userLoginValidation,
    userUpdateValidation,
    userDeleteValidation,
    
    // Book validations
    bookCreateValidation,
    bookUpdateValidation,
    bookSearchValidation,
    bookDeleteValidation,
    getBooksByAuthorValidation,
    
    // Reader validations
    readerProfileValidation,
    borrowReturnBookValidation,
    getBorrowedBooksValidation,
    
    // Auth validations
    validateAuthHeader,
    
    // Helper functions
    handleValidationErrors,
    validateObjectId
};
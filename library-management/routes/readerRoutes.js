const express = require('express');
const {
    createOrUpdateProfile,
    borrowBook,
    returnBook,
    getBorrowedBooks
} = require('../controllers/readerController');
const { protect } = require('../middleware/authMiddleware');
const {
    readerProfileValidation,
    borrowReturnBookValidation,
    getBorrowedBooksValidation,
    validateAuthHeader
} = require('../middleware/validationMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// Reader management routes
router.post('/profile', validateAuthHeader, protect, readerProfileValidation, createOrUpdateProfile);
router.post('/books/borrow', strictLimiter, validateAuthHeader, protect, borrowReturnBookValidation, borrowBook);
router.post('/books/return', strictLimiter, validateAuthHeader, protect, borrowReturnBookValidation, returnBook);
router.get('/books/:id', validateAuthHeader, protect, getBorrowedBooksValidation, getBorrowedBooks);

module.exports = router;

const express = require('express');
const {
    createBook,
    getBooks,
    getBooksByAuthor,
    updateBook,
    deleteBook,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    bookCreateValidation,
    bookUpdateValidation,
    bookSearchValidation,
    bookDeleteValidation,
    getBooksByAuthorValidation,
    validateAuthHeader
} = require('../middleware/validationMiddleware');
const { strictLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// Book Routes
router.post('/create', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookCreateValidation, createBook);
router.get('/', bookSearchValidation, getBooks); // Public route with search validation
router.get('/author/:id', validateAuthHeader, protect, authorize('Author'), getBooksByAuthorValidation, getBooksByAuthor);
router.put('/update/:id', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookUpdateValidation, updateBook);
router.delete('/delete/:id', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookDeleteValidation, deleteBook);

module.exports = router;

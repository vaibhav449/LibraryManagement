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

/**
 * @swagger
 * tags:
 *   name: Reader
 *   description: Reader profile and book borrowing operations
 */

/**
 * @swagger
 * /reader/profile:
 *   post:
 *     summary: Create or update reader profile
 *     tags: [Reader]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Reading preferences/genres
 *               bio:
 *                 type: string
 *                 description: Reader biography
 *           example:
 *             preferences: ["Fiction", "Mystery", "Science Fiction"]
 *             bio: "Avid reader with a passion for mystery novels"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/profile', validateAuthHeader, protect, readerProfileValidation, createOrUpdateProfile);

/**
 * @swagger
 * /reader/books/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Reader]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID of the book to borrow
 *           example:
 *             bookId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 borrowRecord:
 *                   type: object
 *       400:
 *         description: Book not available or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.post('/books/borrow', strictLimiter, validateAuthHeader, protect, borrowReturnBookValidation, borrowBook);

/**
 * @swagger
 * /reader/books/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Reader]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID of the book to return
 *           example:
 *             bookId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       400:
 *         description: Book not borrowed by user or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.post('/books/return', strictLimiter, validateAuthHeader, protect, borrowReturnBookValidation, returnBook);

/**
 * @swagger
 * /reader/borrowed:
 *   get:
 *     summary: Get all books borrowed by the current reader
 *     tags: [Reader]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of borrowed books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 borrowedBooks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book:
 *                         $ref: '#/components/schemas/Book'
 *                       borrowDate:
 *                         type: string
 *                         format: date-time
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/borrowed', validateAuthHeader, protect, getBorrowedBooks);

/**
 * @swagger
 * /reader/books/{id}:
 *   get:
 *     summary: Get borrowed books for specific reader (alternative endpoint)
 *     tags: [Reader]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reader ID
 *     responses:
 *       200:
 *         description: List of borrowed books
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Reader not found
 */
router.get('/books/:id', validateAuthHeader, protect, getBorrowedBooksValidation, getBorrowedBooks);

module.exports = router;

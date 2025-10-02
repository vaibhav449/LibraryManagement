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

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management operations
 */

/**
 * @swagger
 * /books/create:
 *   post:
 *     summary: Create a new book (Author only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCreateRequest'
 *           example:
 *             title: "The Great Gatsby"
 *             isbn: "978-0-7432-7356-5"
 *             author: "F. Scott Fitzgerald"
 *             genre: "Fiction"
 *             stock: 10
 *             description: "A classic American novel"
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Author role required
 */
router.post('/create', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookCreateValidation, createBook);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with optional search
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, author, or genre
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of books per page
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalBooks:
 *                   type: integer
 */
router.get('/', bookSearchValidation, getBooks);

/**
 * @swagger
 * /books/author/{id}:
 *   get:
 *     summary: Get books by specific author (Author only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: List of author's books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized - Author role required
 *       404:
 *         description: Author not found
 */
router.get('/author/:id', validateAuthHeader, protect, authorize('Author'), getBooksByAuthorValidation, getBooksByAuthor);

/**
 * @swagger
 * /books/update/{id}:
 *   put:
 *     summary: Update a book (Author only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               genre:
 *                 type: string
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Author role required
 *       404:
 *         description: Book not found
 */
router.put('/update/:id', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookUpdateValidation, updateBook);

/**
 * @swagger
 * /books/delete/{id}:
 *   delete:
 *     summary: Delete a book (Author only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized - Author role required
 *       404:
 *         description: Book not found
 */
router.delete('/delete/:id', strictLimiter, validateAuthHeader, protect, authorize('Author'), bookDeleteValidation, deleteBook);

module.exports = router;

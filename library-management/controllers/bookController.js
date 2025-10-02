const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a Book
exports.createBook = async (req, res) => {
    try {
        const { title, genre, stock } = req.body;

        // Ensure only authors can create books (already checked in middleware)
        if (req.user.role !== 'Author') {
            return res.status(403).json({ message: 'Only authors can create books' });
        }

        // Create a new book
        const book = await Book.create({
            title: title.trim(),
            author: req.user.id,
            genre: genre.trim(),
            stock: parseInt(stock),
        });

        // Add the book to the author's writtenBooks list
        await User.findByIdAndUpdate(req.user.id, { $push: { writtenBooks: book._id } });

        res.status(201).json({ 
            message: 'Book created successfully', 
            book: {
                id: book._id,
                title: book.title,
                author: {
                    id: req.user._id,
                    name: req.user.name
                },
                genre: book.genre,
                stock: book.stock
            }
        });
    } catch (error) {
        console.error('Create book error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during book creation' 
        });
    }
};

// Get All Books or Search by Query
exports.getBooks = async (req, res) => {
    try {
        const { title, author, genre, page = 1, limit = 10 } = req.query;

        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
        
        // Build query object dynamically
        const query = {};
        
        if (title) {
            query.title = { $regex: title.trim(), $options: 'i' };
        }
        
        if (author) {
            // Validate author ID if provided
            if (!mongoose.Types.ObjectId.isValid(author)) {
                return res.status(400).json({ message: 'Invalid author ID format' });
            }
            query.author = author;
        }
        
        if (genre) {
            query.genre = { $regex: genre.trim(), $options: 'i' };
        }

        // Execute query with pagination
        const skip = (pageNum - 1) * limitNum;
        const [books, totalBooks] = await Promise.all([
            Book.find(query)
                .populate('author', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Book.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalBooks / limitNum);

        res.status(200).json({
            books,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalBooks,
                booksPerPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving books' 
        });
    }
};

// Get Books by Author
exports.getBooksByAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid author ID format' });
        }

        // Ensure only authors can access their own books
        if (req.user.role !== 'Author' || req.user.id !== id) {
            return res.status(403).json({ message: 'You are not authorized to view these books' });
        }

        // Get pagination parameters
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Fetch books with pagination
        const [books, totalBooks] = await Promise.all([
            Book.find({ author: id })
                .populate('borrowedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Book.countDocuments({ author: id })
        ]);

        const totalPages = Math.ceil(totalBooks / limitNum);

        res.status(200).json({
            books,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalBooks,
                booksPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Get books by author error:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving author books' 
        });
    }
};

// Update Book Details
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, genre, stock } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }

        // Check if at least one field is provided
        if (!title && !genre && stock === undefined) {
            return res.status(400).json({ 
                message: 'At least one field (title, genre, or stock) must be provided' 
            });
        }

        // Find the book and ensure the requester is the author
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.user.role !== 'Author' || book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this book' });
        }

        // Validate stock changes
        if (stock !== undefined) {
            const stockDifference = stock - book.stock;
            const currentBorrowers = book.borrowedBy ? book.borrowedBy.length : 0;
            
            if (stock < currentBorrowers) {
                return res.status(400).json({ 
                    message: `Cannot reduce stock below current borrowed copies (${currentBorrowers})` 
                });
            }
        }

        // Update book details
        const updateData = {};
        if (title) updateData.title = title.trim();
        if (genre) updateData.genre = genre.trim();
        if (stock !== undefined) updateData.stock = parseInt(stock);

        const updatedBook = await Book.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        res.status(200).json({ 
            message: 'Book updated successfully', 
            book: updatedBook 
        });
    } catch (error) {
        console.error('Update book error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during book update' 
        });
    }
};

// Delete a Book
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }

        // Find the book and ensure the requester is the author
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.user.role !== 'Author' || book.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this book' });
        }

        // Check if book is currently borrowed
        if (book.borrowedBy && book.borrowedBy.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete book that is currently borrowed. Please wait for all copies to be returned.' 
            });
        }

        // Delete the book
        await Book.findByIdAndDelete(id);

        // Remove the book from the author's writtenBooks list
        await User.findByIdAndUpdate(req.user.id, { $pull: { writtenBooks: id } });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ 
            message: 'Internal server error during book deletion' 
        });
    }
};


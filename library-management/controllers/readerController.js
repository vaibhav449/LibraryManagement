const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create or Manage Reader Profile
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { id } = req.user; // Authenticated user's ID
        const { name, email } = req.body;

        // Check if at least one field is provided
        if (!name && !email) {
            return res.status(400).json({ 
                message: 'At least one field (name or email) must be provided' 
            });
        }

        // Find and validate user
        const user = await User.findById(id);
        if (!user || user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can manage profiles' });
        }

        // Check for email uniqueness if email is being updated
        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: id } 
            });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already exists' });
            }
        }

        // Update fields
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.toLowerCase().trim();

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during profile update' 
        });
    }
};



// Borrow a Book
exports.borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        
        // Validate bookId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }

        const user = await User.findById(req.user.id).populate('borrowedBooks');

        if (user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can borrow books' });
        }

        // Check if user already borrowed this book
        const alreadyBorrowed = user.borrowedBooks.some(book => book._id.toString() === bookId);
        if (alreadyBorrowed) {
            return res.status(400).json({ message: 'You have already borrowed this book' });
        }

        // Check borrow limit
        if (user.borrowedBooks.length >= 5) {
            return res.status(400).json({ message: 'Borrow limit reached (maximum 5 books)' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.stock <= 0) {
            return res.status(400).json({ message: 'Book is out of stock' });
        }

        // Perform the transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update user's borrowed books
            user.borrowedBooks.push(book._id);
            await user.save({ session });

            // Update book stock and borrowers
            book.stock -= 1;
            book.borrowedBy.push(user._id);
            await book.save({ session });

            await session.commitTransaction();

            res.status(200).json({ 
                message: 'Book borrowed successfully', 
                book: {
                    id: book._id,
                    title: book.title,
                    genre: book.genre,
                    remainingStock: book.stock
                }
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Borrow book error:', error);
        res.status(500).json({ 
            message: 'Internal server error during book borrowing' 
        });
    }
};

// Return a Book
exports.returnBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        
        // Validate bookId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({ message: 'Invalid book ID format' });
        }

        const user = await User.findById(req.user.id).populate('borrowedBooks');

        if (user.role !== 'Reader') {
            return res.status(403).json({ message: 'Only readers can return books' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if user has actually borrowed this book
        const borrowedBookIndex = user.borrowedBooks.findIndex(
            borrowedBook => borrowedBook._id.toString() === bookId
        );
        if (borrowedBookIndex === -1) {
            return res.status(400).json({ message: 'You have not borrowed this book' });
        }

        // Perform the transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Remove book from user's borrowed list
            user.borrowedBooks = user.borrowedBooks.filter(
                borrowedBook => borrowedBook._id.toString() !== bookId
            );
            await user.save({ session });

            // Increase book stock and remove from borrowers
            book.stock += 1;
            book.borrowedBy = book.borrowedBy.filter(
                borrowerId => borrowerId.toString() !== user._id.toString()
            );
            await book.save({ session });

            await session.commitTransaction();

            res.status(200).json({ 
                message: 'Book returned successfully', 
                book: {
                    id: book._id,
                    title: book.title,
                    genre: book.genre,
                    availableStock: book.stock
                }
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({ 
            message: 'Internal server error during book return' 
        });
    }
};

// Get All Borrowed Books
exports.getBorrowedBooks = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Ensure user can only access their own borrowed books or admin access
        if (req.user.id !== id) {
            return res.status(403).json({ 
                message: 'You can only view your own borrowed books' 
            });
        }

        const user = await User.findById(id).populate({
            path: 'borrowedBooks',
            select: 'title genre stock author',
            populate: {
                path: 'author',
                select: 'name email'
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'Reader') {
            return res.status(400).json({ message: 'User is not a reader' });
        }

        res.status(200).json({ 
            borrowedBooks: user.borrowedBooks,
            totalBorrowed: user.borrowedBooks.length,
            remainingSlots: 5 - user.borrowedBooks.length
        });
    } catch (error) {
        console.error('Get borrowed books error:', error);
        res.status(500).json({ 
            message: 'Internal server error while retrieving borrowed books' 
        });
    }
};

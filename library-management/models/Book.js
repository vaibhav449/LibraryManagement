const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        trim: true,
        minlength: [1, 'Title must be at least 1 character long'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
        match: [/^[a-zA-Z0-9\s\-_.,:;!?'"()]+$/, 'Title contains invalid characters']
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Author is required'],
        validate: {
            validator: async function(authorId) {
                const User = mongoose.model('User');
                const author = await User.findById(authorId);
                return author && author.role === 'Author';
            },
            message: 'Referenced user must have Author role'
        }
    },
    genre: { 
        type: String, 
        required: [true, 'Genre is required'],
        trim: true,
        minlength: [2, 'Genre must be at least 2 characters long'],
        maxlength: [50, 'Genre cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s\-&]+$/, 'Genre can only contain letters, spaces, hyphens, and ampersands']
    },
    stock: { 
        type: Number, 
        default: 0,
        min: [0, 'Stock cannot be negative'],
        max: [10000, 'Stock cannot exceed 10000'],
        validate: {
            validator: Number.isInteger,
            message: 'Stock must be an integer'
        }
    },
    borrowedBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        validate: {
            validator: async function(userId) {
                const User = mongoose.model('User');
                const user = await User.findById(userId);
                return user && user.role === 'Reader';
            },
            message: 'Only readers can borrow books'
        }
    }],
}, {
    timestamps: true
});

// Indexes for better performance and search
bookSchema.index({ title: 'text', genre: 'text' });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ stock: 1 });

// Virtual for available stock
bookSchema.virtual('availableStock').get(function() {
    return this.stock;
});

// Pre-save validation
bookSchema.pre('save', function(next) {
    // Ensure stock is not negative
    if (this.stock < 0) {
        return next(new Error('Stock cannot be negative'));
    }
    
    // Ensure borrowedBy array doesn't exceed stock
    if (this.borrowedBy && this.borrowedBy.length > this.stock + this.borrowedBy.length) {
        return next(new Error('Cannot have more borrowers than total copies'));
    }
    
    next();
});

// Instance methods
bookSchema.methods.isAvailable = function() {
    return this.stock > 0;
};

bookSchema.methods.canBeBorrowed = function() {
    return this.stock > 0;
};

module.exports = mongoose.model('Book', bookSchema);

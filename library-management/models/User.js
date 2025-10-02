const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
    },
    email: { 
        type: String, 
        unique: true, 
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email cannot exceed 100 characters'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        maxlength: [128, 'Password cannot exceed 128 characters']
    },
    role: { 
        type: String, 
        enum: {
            values: ['Reader', 'Author'],
            message: 'Role must be either Reader or Author'
        }, 
        required: [true, 'Role is required']
    },
    borrowedBooks: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book',
        validate: {
            validator: function(arr) {
                return arr.length <= 5;
            },
            message: 'Cannot borrow more than 5 books'
        }
    }],
    writtenBooks: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book' 
    }],
}, {
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Indexes for better performance (email index is already created by unique: true)
userSchema.index({ role: 1 });

// Pre-save validation
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();
    
    // Additional password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(this.password)) {
        return next(new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number'));
    }
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);

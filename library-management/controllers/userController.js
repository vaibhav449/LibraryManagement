const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

// Signup Controller
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ 
                message: 'User with this email already exists' 
            });
        }
        
        // Create user
        const user = await User.create({ 
            name: name.trim(), 
            email: email.toLowerCase().trim(), 
            password, 
            role 
        });

        // Generate token valid for 15 days
        const token = generateToken(user._id);

        res.status(201).json({ 
            message: 'User created successfully', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ 
                message: 'Email already exists' 
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during user creation' 
        });
    }
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email (case insensitive)
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate token valid for 15 days
        const token = generateToken(user._id);

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal server error during login' 
        });
    }
};


exports.validateSession = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) throw new Error('Invalid session');

        res.status(200).json({ message: 'Session is valid', user });
    } catch (error) {
        res.status(401).json({ message: 'Session is invalid or expired' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        // Check if at least one field is provided
        if (!name && !password) {
            return res.status(400).json({ 
                message: 'At least one field (name or password) must be provided' 
            });
        }

        // Find the user by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) {
            user.name = name.trim();
        }

        if (password) {
            user.password = password; // Will be hashed by pre-save middleware
        }

        // Save changes (triggers validation and password hashing)
        await user.save();

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during user update' 
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Find the user first to check if they exist and get their data
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user has borrowed books (prevent deletion if they do)
        if (user.borrowedBooks && user.borrowedBooks.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete user with borrowed books. Please return all books first.' 
            });
        }
        
        // If user is an author, check if they have books
        if (user.role === 'Author' && user.writtenBooks && user.writtenBooks.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete author with published books. Please remove all books first.' 
            });
        }

        // Delete the user
        await User.findByIdAndDelete(id);

        res.status(200).json({ 
            message: 'User account deleted successfully' 
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            message: 'Internal server error during user deletion' 
        });
    }
};
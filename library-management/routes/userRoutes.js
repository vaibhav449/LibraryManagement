const express = require('express');
const { signup, login, validateSession, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeSelf } = require('../middleware/authMiddleware');
const {
    userSignupValidation,
    userLoginValidation,
    userUpdateValidation,
    userDeleteValidation,
    validateAuthHeader
} = require('../middleware/validationMiddleware');
const { createAccountLimiter, loginLimiter, strictLimiter } = require('../middleware/securityMiddleware');

const router = express.Router();

// User authentication routes
router.post('/signup', createAccountLimiter, userSignupValidation, signup);
router.post('/login', loginLimiter, userLoginValidation, login);
router.get('/session/validate', validateAuthHeader, protect, validateSession);

// User management routes
router.put('/update/:id', strictLimiter, validateAuthHeader, protect, authorizeSelf, userUpdateValidation, updateUser);
router.delete('/delete/:id', strictLimiter, validateAuthHeader, protect, authorizeSelf, userDeleteValidation, deleteUser);

module.exports = router;

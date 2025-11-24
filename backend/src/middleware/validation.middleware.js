const { body, validationResult } = require('express-validator');

// Registration validation
const validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 100 })
        .withMessage('Password must be 8-100 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
];

// Login validation
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// Post validation
const validatePost = [
    body('content')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Content too long (max 5000 characters)'),
    body('imageUrl')
        .optional()
        .trim(),
    body('privacy')
        .optional()
        .isIn(['PUBLIC', 'PRIVATE'])
        .withMessage('Invalid privacy setting'),
];

// Comment validation
const validateComment = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment cannot be empty')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment must be 1-2000 characters'),
    body('parentId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid parent comment ID'),
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validatePost,
    validateComment,
    handleValidationErrors,
};

const express = require('express');
const { register, login, logout, me } = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

module.exports = router;

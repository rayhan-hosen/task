const express = require('express');
const { upload, uploadImage } = require('../controllers/upload.controller');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, upload.single('image'), uploadImage);

module.exports = router;

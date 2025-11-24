const express = require('express');
const { createPost, getFeed, toggleLike, addComment, getComments, toggleCommentLike } = require('../controllers/post.controller');
const authenticateToken = require('../middleware/auth.middleware');
const { validatePost, validateComment, handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/', authenticateToken, validatePost, handleValidationErrors, createPost);
router.get('/', authenticateToken, getFeed);
router.post('/:postId/like', authenticateToken, toggleLike);
router.post('/:postId/comments', authenticateToken, validateComment, handleValidationErrors, addComment);
router.get('/:postId/comments', authenticateToken, getComments);
router.post('/comments/:commentId/like', authenticateToken, toggleCommentLike);

module.exports = router;

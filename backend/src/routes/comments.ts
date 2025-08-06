import express from 'express';
import {
  getCommentsByIssue,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/comments/issue/:issueId - Get comments for an issue
router.get('/issue/:issueId', getCommentsByIssue);

// POST /api/comments - Create new comment
router.post('/', createComment);

// PUT /api/comments/:id - Update comment
router.put('/:id', updateComment);

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', deleteComment);

export default router;
import express from 'express';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  assignIssue
} from '../controllers/issueController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../../../shared/src/constants';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/issues - Get all issues
router.get('/', getIssues);

// GET /api/issues/:id - Get single issue
router.get('/:id', getIssue);

// POST /api/issues - Create new issue (Contributors and Admins)
router.post('/', authorize(UserRole.CONTRIBUTOR, UserRole.ADMIN), createIssue);

// PUT /api/issues/:id - Update issue
router.put('/:id', updateIssue);

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', deleteIssue);

// PATCH /api/issues/:id/assign - Assign issue (Contributors and Admins)
router.patch('/:id/assign', authorize(UserRole.CONTRIBUTOR, UserRole.ADMIN), assignIssue);

export default router;
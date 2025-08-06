import express from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/dashboard/activity - Get recent activity
router.get('/activity', getRecentActivity);

export default router;
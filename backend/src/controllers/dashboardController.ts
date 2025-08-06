import { Response } from 'express';
import Issue from '../models/Issue';
import Comment from '../models/Comment';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { IssueStatus } from '../../../shared/src/constants';

// Get dashboard statistics
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Get total counts
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: IssueStatus.OPEN });
    const inProgressIssues = await Issue.countDocuments({ status: IssueStatus.IN_PROGRESS });
    const resolvedIssues = await Issue.countDocuments({ status: IssueStatus.RESOLVED });
    const closedIssues = await Issue.countDocuments({ status: IssueStatus.CLOSED });

    // Get user-specific counts
    const myCreatedIssues = await Issue.countDocuments({ createdBy: req.user._id });
    const myAssignedIssues = await Issue.countDocuments({ assignedTo: req.user._id });

    // Get recent activity (last 10 issues)
    const recentIssues = await Issue.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    // Get recent comments (last 10)
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'username email')
      .populate('issueId', 'title');

    const stats = {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      myCreatedIssues,
      myAssignedIssues,
      recentIssues,
      recentComments
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching dashboard statistics'
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    // Get recent issues
    const recentIssues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');

    // Get recent comments
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(limit / 2)
      .populate('createdBy', 'username email')
      .populate('issueId', 'title');

    // Combine and format activity
    const activity = [
      ...recentIssues.map(issue => ({
        type: 'issue_created',
        message: `${(issue.createdBy as any).username} created issue "${issue.title}"`,
        user: issue.createdBy,
        issue: issue,
        timestamp: issue.createdAt
      })),
      ...recentComments.map(comment => ({
        type: 'comment_added',
        message: `${(comment.createdBy as any).username} commented on "${(comment.issueId as any).title}"`,
        user: comment.createdBy,
        comment: comment,
        timestamp: comment.createdAt
      }))
    ];

    // Sort by timestamp and limit
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivity = activity.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedActivity,
      count: limitedActivity.length
    });
  } catch (error: any) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching recent activity'
    });
  }
};
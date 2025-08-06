import { Response } from 'express';
import Issue from '../models/Issue';
import { AuthenticatedRequest } from '../middleware/auth';
import { IssueStatus, UserRole } from '../../../shared/src/constants';

// Get all issues with filtering and pagination
export const getIssues = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      createdBy,
      search,
      tags
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search as string };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get issues with pagination
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching issues'
    });
  }
};

// Get single issue by ID
export const getIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error: any) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching issue'
    });
  }
};

// Create new issue
export const createIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { title, description, priority, assignedTo, tags } = req.body;

    const issue = await Issue.create({
      title,
      description,
      priority,
      assignedTo: assignedTo || null,
      tags: tags || [],
      createdBy: req.user._id
    });

    // Populate the created issue
    await issue.populate([
      { path: 'createdBy', select: 'username email role' },
      { path: 'assignedTo', select: 'username email role' }
    ]);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:created', issue);
    }

    res.status(201).json({
      success: true,
      data: issue,
      message: 'Issue created successfully'
    });
  } catch (error: any) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating issue'
    });
  }
};

// Update issue
export const updateIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    // Check permissions
    const canEdit = req.user.role === UserRole.ADMIN || 
               issue.createdBy.toString() === (req.user._id as any).toString() ||
               (issue.assignedTo && issue.assignedTo.toString() === (req.user._id as any).toString());

    if (!canEdit) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this issue'
      });
      return;
    }

    const { title, description, status, priority, assignedTo, tags } = req.body;
    const oldStatus = issue.status;

    // Update fields
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;
    if (priority !== undefined) issue.priority = priority;
    if (assignedTo !== undefined) issue.assignedTo = assignedTo;
    if (tags !== undefined) issue.tags = tags;

    await issue.save();
    await issue.populate([
      { path: 'createdBy', select: 'username email role' },
      { path: 'assignedTo', select: 'username email role' }
    ]);

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:updated', issue);
      
      // Special event for status changes
      if (status && status !== oldStatus) {
        io.emit('issue:status_changed', {
          issue,
          oldStatus,
          newStatus: status
        });
      }
    }

    res.status(200).json({
      success: true,
      data: issue,
      message: 'Issue updated successfully'
    });
  } catch (error: any) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating issue'
    });
  }
};

// Delete issue
export const deleteIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    // Check permissions (only creator or admin can delete)
    const canDelete = req.user.role === UserRole.ADMIN || 
                 issue.createdBy.toString() === (req.user._id as any).toString();

    if (!canDelete) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this issue'
      });
      return;
    }

    await Issue.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:deleted', { issueId: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting issue'
    });
  }
};

// Assign issue to user
export const assignIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    // Check permissions
    const canAssign = req.user.role === UserRole.ADMIN || 
                     req.user.role === UserRole.CONTRIBUTOR;

    if (!canAssign) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to assign issues'
      });
      return;
    }

    issue.assignedTo = assignedTo;
    await issue.save();
    await issue.populate([
      { path: 'createdBy', select: 'username email role' },
      { path: 'assignedTo', select: 'username email role' }
    ]);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:assigned', issue);
    }

    res.status(200).json({
      success: true,
      data: issue,
      message: 'Issue assigned successfully'
    });
  } catch (error: any) {
    console.error('Assign issue error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error assigning issue'
    });
  }
};
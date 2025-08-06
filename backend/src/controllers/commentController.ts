import { Response } from 'express';
import Comment from '../models/Comment';
import Issue from '../models/Issue';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../../../shared/src/constants';

// Get comments for an issue
export const getCommentsByIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { issueId } = req.params;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    const comments = await Comment.find({ issueId })
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching comments'
    });
  }
};

// Create new comment
export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { content, issueId } = req.body;

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
      return;
    }

    const comment = await Comment.create({
      content,
      issueId,
      createdBy: req.user._id
    });

    // Populate the created comment
    await comment.populate({
      path: 'createdBy',
      select: 'username email role'
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('comment:added', {
        comment,
        issueId
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment created successfully'
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating comment'
    });
  }
};

// Update comment
export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
      return;
    }

    // Check permissions (only creator or admin can update)
    const canUpdate = req.user.role === UserRole.ADMIN || 
                     comment.createdBy.toString() === req.user._id.toString();

    if (!canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
      return;
    }

    const { content } = req.body;
    comment.content = content;
    await comment.save();

    await comment.populate({
      path: 'createdBy',
      select: 'username email role'
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('comment:updated', comment);
    }

    res.status(200).json({
      success: true,
      data: comment,
      message: 'Comment updated successfully'
    });
  } catch (error: any) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating comment'
    });
  }
};

// Delete comment
export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
      return;
    }

    // Check permissions (only creator or admin can delete)
    const canDelete = req.user.role === UserRole.ADMIN || 
                     comment.createdBy.toString() === req.user._id.toString();

    if (!canDelete) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
      return;
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('comment:deleted', { 
        commentId: req.params.id,
        issueId: comment.issueId 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting comment'
    });
  }
};
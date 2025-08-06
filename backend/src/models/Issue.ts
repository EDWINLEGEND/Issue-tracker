import mongoose, { Document, Schema } from 'mongoose';
import { IssueStatus, IssuePriority } from '../../../shared/src/constants';

export interface IIssue extends Document {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: Object.values(IssueStatus),
    default: IssueStatus.OPEN,
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(IssuePriority),
    default: IssuePriority.MEDIUM,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issue creator is required']
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ createdBy: 1 });
issueSchema.index({ assignedTo: 1 });
issueSchema.index({ tags: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' }); // Text search index

// Virtual for comments count
issueSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issueId',
  count: true
});

// Ensure virtual fields are serialized
issueSchema.set('toJSON', { virtuals: true });

// Pre-populate creator and assignee information
issueSchema.pre(/^find/, function(next) {
  (this as any).populate({
    path: 'createdBy',
    select: 'username email role'
  }).populate({
    path: 'assignedTo',
    select: 'username email role'
  });
  next();
});

const Issue = mongoose.model<IIssue>('Issue', issueSchema);

export default Issue;
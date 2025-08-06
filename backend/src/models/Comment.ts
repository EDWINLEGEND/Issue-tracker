import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  issueId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: [true, 'Issue ID is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment creator is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
commentSchema.index({ issueId: 1 });
commentSchema.index({ createdBy: 1 });
commentSchema.index({ createdAt: -1 });

// Pre-populate creator information
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'username email role'
  });
  next();
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
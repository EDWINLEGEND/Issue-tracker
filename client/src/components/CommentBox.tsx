import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { commentsAPI } from '@/services/api'
import { Comment } from '../../../shared/src/types'
import { formatRelativeTime } from '../../../shared/src/utils'
import toast from 'react-hot-toast'

interface CommentBoxProps {
  issueId: string
  comments: Comment[]
  onCommentAdded: (comment: Comment) => void
}

interface CommentForm {
  content: string
}

const CommentBox: React.FC<CommentBoxProps> = ({ 
  issueId, 
  comments, 
  onCommentAdded 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentForm>()

  const onSubmit = async (data: CommentForm) => {
    setIsSubmitting(true)
    try {
      const response = await commentsAPI.create({
        content: data.content,
        issueId,
      })
      
      if (response.data.success) {
        onCommentAdded(response.data.data)
        reset()
        toast.success('Comment added successfully!')
      } else {
        toast.error(response.data.error || 'Failed to add comment')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add comment'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Comments ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {typeof comment.createdBy === 'object'
                          ? comment.createdBy.username.charAt(0).toUpperCase()
                          : '?'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {typeof comment.createdBy === 'object'
                          ? comment.createdBy.username
                          : 'Unknown User'
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <div className="border-t pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="content" className="label">
              Add a comment
            </label>
            <textarea
              {...register('content', {
                required: 'Comment cannot be empty',
                minLength: {
                  value: 1,
                  message: 'Comment cannot be empty',
                },
                maxLength: {
                  value: 1000,
                  message: 'Comment cannot exceed 1000 characters',
                },
              })}
              rows={4}
              className="input"
              placeholder="Write your comment here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentBox
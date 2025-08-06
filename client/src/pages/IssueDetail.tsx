import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { issuesAPI, commentsAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useSocket } from '@/contexts/SocketContext'
import CommentBox from '@/components/CommentBox'
import { 
  STATUS_COLORS, 
  PRIORITY_COLORS,
  IssueStatus,
  IssuePriority,
  UserRole,
  getStatusDisplayName, 
  getPriorityDisplayName,
  formatDate
} from '@shared/utils'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const IssueDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { joinIssue, leaveIssue } = useSocket()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  })

  // Fetch issue details
  const { data: issueData, isLoading } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesAPI.getById(id!),
    enabled: !!id,
  })

  // Fetch comments
  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsAPI.getByIssue(id!),
    enabled: !!id,
  })

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: (data: any) => issuesAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] })
      setIsEditing(false)
      toast.success('Issue updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update issue')
    },
  })

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: () => issuesAPI.delete(id!),
    onSuccess: () => {
      toast.success('Issue deleted successfully!')
      navigate('/issues')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete issue')
    },
  })

  const issue = issueData?.data.data
  const comments = commentsData?.data.data || []

  // Join/leave issue room for real-time updates
  useEffect(() => {
    if (id) {
      joinIssue(id)
      return () => leaveIssue(id)
    }
  }, [id, joinIssue, leaveIssue])

  // Initialize edit data when issue loads
  useEffect(() => {
    if (issue) {
      setEditData({
        status: issue.status,
        priority: issue.priority,
        assignedTo: typeof issue.assignedTo === 'object' ? issue.assignedTo?._id || '' : issue.assignedTo || ''
      })
    }
  }, [issue])

  const handleSaveEdit = () => {
    updateIssueMutation.mutate(editData)
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      deleteIssueMutation.mutate()
    }
  }

  const handleCommentAdded = (comment: any) => {
    refetchComments()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="card p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue not found</h2>
        <Link to="/issues" className="btn-primary">
          Back to Issues
        </Link>
      </div>
    )
  }

  const canEdit = user?.role === UserRole.ADMIN || 
                 (typeof issue.createdBy === 'object' && issue.createdBy._id === user?._id) ||
                 (typeof issue.assignedTo === 'object' && issue.assignedTo._id === user?._id)

  const canDelete = user?.role === UserRole.ADMIN || 
                   (typeof issue.createdBy === 'object' && issue.createdBy._id === user?._id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Issues
        </button>
        
        {(canEdit || canDelete) && (
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center space-x-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Issue Details */}
      <div className="card p-6">
        <div className="space-y-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {issue.title}
            </h1>
            <div className="flex items-center space-x-2">
              <span className={clsx('badge', STATUS_COLORS[issue.status])}>
                {getStatusDisplayName(issue.status)}
              </span>
              <span className={clsx('badge', PRIORITY_COLORS[issue.priority])}>
                {getPriorityDisplayName(issue.priority)}
              </span>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span>
                Created by{' '}
                {typeof issue.createdBy === 'object'
                  ? issue.createdBy.username
                  : 'Unknown'
                }
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Created {formatDate(issue.createdAt)}</span>
            </div>

            {issue.assignedTo && (
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>
                  Assigned to{' '}
                  {typeof issue.assignedTo === 'object'
                    ? issue.assignedTo.username
                    : 'Unknown'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {issue.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && canEdit && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Issue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="input"
                  >
                    {Object.values(IssueStatus).map((status) => (
                      <option key={status} value={status}>
                        {getStatusDisplayName(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Priority</label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    className="input"
                  >
                    {Object.values(IssuePriority).map((priority) => (
                      <option key={priority} value={priority}>
                        {getPriorityDisplayName(priority)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Assign to</label>
                  <select
                    value={editData.assignedTo}
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                    className="input"
                  >
                    <option value="">Unassigned</option>
                    {/* TODO: Add users list */}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateIssueMutation.isPending}
                  className="btn-primary"
                >
                  {updateIssueMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="card p-6">
        <CommentBox
          issueId={issue._id}
          comments={comments}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  )
}

export default IssueDetail
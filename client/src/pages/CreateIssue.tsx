import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { issuesAPI, authAPI } from '@/services/api'
import { IssuePriority, getPriorityDisplayName } from '@shared/utils'
import toast from 'react-hot-toast'

interface CreateIssueForm {
  title: string
  description: string
  priority: IssuePriority
  assignedTo?: string
  tags: string
}

const CreateIssue = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIssueForm>({
    defaultValues: {
      priority: IssuePriority.MEDIUM
    }
  })

  // Fetch users for assignment dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getUsers(),
  })

  const onSubmit = async (data: CreateIssueForm) => {
    setIsLoading(true)
    try {
      const issueData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignedTo: data.assignedTo || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }

      const response = await issuesAPI.create(issueData)
      
      if (response.data.success) {
        toast.success('Issue created successfully!')
        navigate('/issues')
      } else {
        toast.error(response.data.error || 'Failed to create issue')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create issue'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Issue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to create a new issue.
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="label">
              Title *
            </label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 5,
                  message: 'Title must be at least 5 characters',
                },
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters',
                },
              })}
              type="text"
              className="input"
              placeholder="Brief description of the issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters',
                },
                maxLength: {
                  value: 2000,
                  message: 'Description cannot exceed 2000 characters',
                },
              })}
              rows={6}
              className="input"
              placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Priority and Assignment Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="label">
                Priority *
              </label>
              <select
                {...register('priority', { required: 'Priority is required' })}
                className="input"
              >
                {Object.values(IssuePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {getPriorityDisplayName(priority)}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            {/* Assign To */}
            <div>
              <label htmlFor="assignedTo" className="label">
                Assign to
              </label>
              <select
                {...register('assignedTo')}
                className="input"
              >
                <option value="">Unassigned</option>
                {users?.data.data?.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="label">
              Tags
            </label>
            <input
              {...register('tags')}
              type="text"
              className="input"
              placeholder="Enter tags separated by commas (e.g., bug, urgent, frontend)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateIssue
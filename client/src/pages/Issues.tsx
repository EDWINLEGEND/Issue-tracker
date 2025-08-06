import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline'
import { issuesAPI } from '@/services/api'
import IssueCard from '@/components/IssueCard'
import { 
  IssueStatus, 
  IssuePriority, 
  getStatusDisplayName, 
  getPriorityDisplayName 
} from '@shared/utils'
import clsx from 'clsx'

const Issues = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  // Get filter values from URL params
  const currentPage = parseInt(searchParams.get('page') || '1')
  const currentStatus = searchParams.get('status') || ''
  const currentPriority = searchParams.get('priority') || ''
  const currentSearch = searchParams.get('search') || ''

  // Fetch issues with filters
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['issues', currentPage, currentStatus, currentPriority, currentSearch],
    queryFn: () => issuesAPI.getAll({
      page: currentPage,
      limit: 10,
      status: currentStatus || undefined,
      priority: currentPriority || undefined,
      search: currentSearch || undefined,
    }),
  })

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete('page') // Reset to page 1 when filtering
    setSearchParams(newParams)
  }

  const updatePage = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page.toString())
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const issues = issuesData?.data.data || []
  const pagination = issuesData?.data.pagination

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Issues skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination?.total || 0} total issues
          </p>
        </div>
        <Link to="/issues/new" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>New Issue</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              className="input pl-10"
              value={currentSearch}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn flex items-center space-x-2',
              showFilters ? 'btn-primary' : 'btn-secondary'
            )}
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="label">Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  {Object.values(IssueStatus).map((status) => (
                    <option key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="label">Priority</label>
                <select
                  value={currentPriority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="input"
                >
                  <option value="">All Priorities</option>
                  {Object.values(IssuePriority).map((priority) => (
                    <option key={priority} value={priority}>
                      {getPriorityDisplayName(priority)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No issues found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {currentSearch || currentStatus || currentPriority
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first issue.'
            }
          </p>
          <div className="mt-6">
            <Link to="/issues/new" className="btn-primary">
              Create Issue
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue: any) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updatePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => updatePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Issues
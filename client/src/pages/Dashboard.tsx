import { useQuery } from '@tanstack/react-query'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '@/services/api'
import { IssueStatus, getStatusDisplayName } from '@shared/utils'
import { formatRelativeTime } from '@shared/utils'

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats(),
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => dashboardAPI.getActivity(),
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statsData = stats?.data.data

  const statCards = [
    {
      name: 'Total Issues',
      value: statsData?.totalIssues || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Open Issues',
      value: statsData?.openIssues || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'In Progress',
      value: statsData?.inProgressIssues || 0,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Resolved',
      value: statsData?.resolvedIssues || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your issues.
          </p>
        </div>
        <Link
          to="/issues/new"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Issue</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Issues Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Issues</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Created by me</span>
              <span className="text-sm font-medium text-gray-900">
                {statsData?.myCreatedIssues || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assigned to me</span>
              <span className="text-sm font-medium text-gray-900">
                {statsData?.myAssignedIssues || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/issues/new"
              className="flex items-center p-3 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-3" />
              Create New Issue
            </Link>
            <Link
              to="/issues?status=open"
              className="flex items-center p-3 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-3" />
              View Open Issues
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h3>
        {activity?.data.data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activity?.data.data.slice(0, 10).map((item: any, index: number) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== activity.data.data.slice(0, 10).length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                          <ExclamationTriangleIcon className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{item.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {formatRelativeTime(item.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
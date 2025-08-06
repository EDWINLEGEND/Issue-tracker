import { Link } from 'react-router-dom'
import { 
  CalendarIcon, 
  UserIcon, 
  ChatBubbleLeftIcon,
  TagIcon 
} from '@heroicons/react/24/outline'
import { Issue } from '@shared/types'
import { 
  STATUS_COLORS, 
  PRIORITY_COLORS, 
  getStatusDisplayName, 
  getPriorityDisplayName,
  formatRelativeTime 
} from '@shared/utils'
import clsx from 'clsx'

interface IssueCardProps {
  issue: Issue
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to={`/issues/${issue._id}`}
              className="text-lg font-medium text-gray-900 hover:text-primary-600 truncate"
            >
              {issue.title}
            </Link>
            <span className={clsx('badge', STATUS_COLORS[issue.status])}>
              {getStatusDisplayName(issue.status)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {issue.description}
          </p>

          {/* Tags */}
          {issue.tags && issue.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              <TagIcon className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {issue.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta information */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatRelativeTime(issue.createdAt)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>
                {typeof issue.createdBy === 'object' 
                  ? issue.createdBy.username 
                  : 'Unknown'
                }
              </span>
            </div>

            {issue.assignedTo && (
              <div className="flex items-center space-x-1">
                <span className="text-xs">→</span>
                <span>
                  {typeof issue.assignedTo === 'object'
                    ? issue.assignedTo.username
                    : 'Unknown'
                  }
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span>0</span> {/* TODO: Add comments count */}
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex-shrink-0 ml-4">
          <span className={clsx('badge', PRIORITY_COLORS[issue.priority])}>
            {getPriorityDisplayName(issue.priority)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default IssueCard
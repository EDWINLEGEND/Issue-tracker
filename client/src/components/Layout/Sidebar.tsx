import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@shared/constants'
import clsx from 'clsx'

const Sidebar = () => {
  const { user } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Issues', href: '/issues', icon: ExclamationTriangleIcon },
    { name: 'Create Issue', href: '/issues/new', icon: PlusIcon },
  ]

  // Add admin-only navigation items
  if (user?.role === UserRole.ADMIN) {
    navigation.push(
      { name: 'Users', href: '/users', icon: UsersIcon }
    )
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              Issues
            </span>
          </div>
          
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                    isActive
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={clsx(
                        'mr-3 flex-shrink-0 h-5 w-5',
                        isActive
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info at bottom */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
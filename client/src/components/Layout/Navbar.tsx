import { useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  BellIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { useSocket } from '@/contexts/SocketContext'
import clsx from 'clsx'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const { isConnected } = useSocket()
  const [notifications] = useState([]) // TODO: Implement notifications store

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Issue Tracker
            </h1>
            
            {/* Connection status */}
            <div className="ml-4 flex items-center">
              <div className={clsx(
                'w-2 h-2 rounded-full mr-2',
                isConnected ? 'bg-green-400' : 'bg-red-400'
              )} />
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>

            {/* User dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden md:block text-left">
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                </div>
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'flex px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'flex px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Settings
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={clsx(
                          active ? 'bg-gray-100' : '',
                          'flex w-full px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ExclamationTriangleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, login } = useAuthStore()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(data.email, data.password)
      
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token)
        toast.success('Welcome back!')
      } else {
        toast.error(response.data.error || 'Login failed')
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <ExclamationTriangleIcon className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                autoComplete="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: admin@example.com / password123
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
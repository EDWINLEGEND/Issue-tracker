import React, { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  // The context is mainly for providing auth state to components
  // All auth operations are handled through the store
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, login, logout } = useAuthStore()

  // Verify token on app start
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe()
          if (response.data.success) {
            login(response.data.data, token)
          } else {
            logout()
          }
        } catch (error) {
          console.error('Token verification failed:', error)
          logout()
          toast.error('Session expired. Please login again.')
        }
      }
    }

    verifyToken()
  }, [token, login, logout])

  const value = {}

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
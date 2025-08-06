import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
    
  register: (userData: {
    username: string
    email: string
    password: string
    role?: string
  }) => api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (userData: { username?: string; email?: string }) =>
    api.put('/auth/profile', userData),
    
  getUsers: () => api.get('/auth/users'),
}

// Issues API
export const issuesAPI = {
  getAll: (params?: Record<string, any>) =>
    api.get('/issues', { params }),
    
  getById: (id: string) => api.get(`/issues/${id}`),
  
  create: (issueData: {
    title: string
    description: string
    priority: string
    assignedTo?: string
    tags?: string[]
  }) => api.post('/issues', issueData),
  
  update: (id: string, issueData: Record<string, any>) =>
    api.put(`/issues/${id}`, issueData),
    
  delete: (id: string) => api.delete(`/issues/${id}`),
  
  assign: (id: string, assignedTo: string) =>
    api.patch(`/issues/${id}/assign`, { assignedTo }),
}

// Comments API
export const commentsAPI = {
  getByIssue: (issueId: string) =>
    api.get(`/comments/issue/${issueId}`),
    
  create: (commentData: { content: string; issueId: string }) =>
    api.post('/comments', commentData),
    
  update: (id: string, content: string) =>
    api.put(`/comments/${id}`, { content }),
    
  delete: (id: string) => api.delete(`/comments/${id}`),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
}
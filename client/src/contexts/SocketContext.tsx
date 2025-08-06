import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { SOCKET_EVENTS } from '../../../shared/src/constants'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinIssue: (issueId: string) => void
  leaveIssue: (issueId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { token, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Create socket connection
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      })

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to server')
        setIsConnected(true)
        toast.success('Connected to real-time updates')
      })

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server')
        setIsConnected(false)
        toast.error('Disconnected from real-time updates')
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        toast.error('Failed to connect to real-time updates')
      })

      // Issue events
      newSocket.on(SOCKET_EVENTS.ISSUE_CREATED, (data) => {
        toast.success(`New issue created: ${data.title}`)
      })

      newSocket.on(SOCKET_EVENTS.ISSUE_UPDATED, (data) => {
        toast(`Issue updated: ${data.title}`)
      })

      newSocket.on(SOCKET_EVENTS.ISSUE_STATUS_CHANGED, (data) => {
        toast(`Issue status changed: ${data.issue.title} → ${data.newStatus}`)
      })

      newSocket.on(SOCKET_EVENTS.ISSUE_ASSIGNED, (data) => {
        if (data.assignedTo && data.assignedTo._id === user._id) {
          toast.success(`You were assigned to: ${data.title}`)
        }
      })

      // Comment events
      newSocket.on(SOCKET_EVENTS.COMMENT_ADDED, (data) => {
        // Only show notification if it's not the current user's comment
        if (data.comment.createdBy._id !== user._id) {
          toast(`New comment on issue`)
        }
      })

      // Notification events
      newSocket.on(SOCKET_EVENTS.NOTIFICATION, (notification) => {
        toast(notification.message)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, token, user])

  const joinIssue = (issueId: string) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.JOIN_ISSUE, issueId)
    }
  }

  const leaveIssue = (issueId: string) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.LEAVE_ISSUE, issueId)
    }
  }

  const value = {
    socket,
    isConnected,
    joinIssue,
    leaveIssue
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
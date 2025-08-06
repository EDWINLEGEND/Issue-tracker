import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Layout from '@/components/Layout/Layout'

// Pages
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Issues from '@/pages/Issues'
import CreateIssue from '@/pages/CreateIssue'
import IssueDetail from '@/pages/IssueDetail'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="issues" element={<Issues />} />
              <Route path="issues/new" element={<CreateIssue />} />
              <Route path="issues/:id" element={<IssueDetail />} />
            </Route>
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
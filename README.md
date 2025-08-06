# 🚀 Real-Time Issue Tracker System

A comprehensive, full-stack issue tracking platform built with modern technologies, featuring real-time updates, role-based authentication, and collaborative issue management.

## ✨ Features

### 🎯 Core Functionality
- **Issue Management**: Create, update, assign, and track issues with multiple priority levels
- **Real-time Updates**: Instant notifications using Socket.IO when issues are created, updated, or commented on
- **Role-based Access Control**: Admin, Contributor, and Viewer roles with appropriate permissions
- **Comments System**: Collaborative discussion on issues with real-time updates
- **Dashboard**: Comprehensive overview with statistics and recent activity
- **Advanced Filtering**: Search and filter issues by status, priority, assignee, and tags

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Password hashing with bcrypt
- Role-based route protection
- Rate limiting and security headers
- Input validation and sanitization

### 🎨 Modern UI/UX
- Clean, responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-first approach
- Intuitive navigation and user experience
- Real-time connection status indicators

## 🏗️ Architecture

```
Issue-tracker/
├── client/          # React frontend
├── backend/         # Node.js + Express API
├── shared/          # Shared types and utilities
└── docs/           # Documentation
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- TanStack Query for state management
- Socket.IO client for real-time updates
- React Hook Form for form handling
- Zustand for global state management

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication
- bcryptjs for password hashing
- Helmet for security headers
- Express rate limiting

**Deployment:**
- Vercel for backend deployment
- Netlify for frontend deployment
- MongoDB Atlas for database hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Issue-tracker
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Environment Setup

Create `.env` files in the backend directory:

**backend/.env:**
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issue-tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000
```

**client/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 5000
npm run dev:client   # Frontend on port 3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📋 Default Users

After setting up, you can register users or create them programmatically:

**Admin User:**
- Email: admin@example.com
- Password: password123
- Role: Admin

**Test Users:**
- contributor@example.com / password123 (Contributor)
- viewer@example.com / password123 (Viewer)

## 🎮 Usage Guide

### Creating Issues
1. Navigate to "Issues" → "Create Issue"
2. Fill in title, description, priority, and optional assignee
3. Add tags for better organization
4. Submit to create the issue

### Managing Issues
- **View Issues**: Browse all issues with filtering options
- **Update Status**: Change issue status (Open → In Progress → Resolved → Closed)
- **Assign Issues**: Assign to team members (Contributors and Admins only)
- **Add Comments**: Collaborate through real-time comments

### Real-time Features
- Instant notifications when issues are created or updated
- Live comment updates
- Connection status indicator
- Real-time dashboard statistics

### Role Permissions

| Feature | Viewer | Contributor | Admin |
|---------|---------|-------------|-------|
| View Issues | ✅ | ✅ | ✅ |
| Create Issues | ❌ | ✅ | ✅ |
| Edit Own Issues | ❌ | ✅ | ✅ |
| Edit All Issues | ❌ | ❌ | ✅ |
| Delete Issues | ❌ | Own Only | ✅ |
| Assign Issues | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

## 🚀 Deployment

### Backend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `client/dist`
4. Set environment variables
5. Deploy automatically on push

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your IP addresses (or use 0.0.0.0/0 for development)
4. Copy connection string to environment variables

## 🔧 Development

### Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route components
│   ├── contexts/      # React contexts
│   ├── services/      # API services
│   ├── store/         # Global state management
│   └── utils/         # Utility functions

backend/
├── src/
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── socket/       # Socket.IO handlers
│   └── config/       # Configuration files

shared/
├── src/
│   ├── constants.ts  # Shared constants
│   ├── types.ts      # TypeScript interfaces
│   └── utils.ts      # Shared utilities
```

### Available Scripts

**Root Level:**
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run install:all` - Install all dependencies

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

**Issues:**
- `GET /api/issues` - Get all issues (with filtering)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

**Comments:**
- `GET /api/comments/issue/:issueId` - Get comments for issue
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity

## 🔌 Real-time Events

The application uses Socket.IO for real-time updates:

**Client Events:**
- `join:issue` - Join issue room for updates
- `leave:issue` - Leave issue room

**Server Events:**
- `issue:created` - New issue created
- `issue:updated` - Issue updated
- `issue:status_changed` - Issue status changed
- `comment:added` - New comment added
- `notification` - User-specific notification

## 🛠️ Customization

### Adding New Issue Fields
1. Update the Issue model in `backend/src/models/Issue.ts`
2. Update the Issue interface in `shared/src/types.ts`
3. Update the create/edit forms in the frontend
4. Update the API controllers

### Adding New User Roles
1. Update UserRole enum in `shared/src/constants.ts`
2. Update authentication middleware
3. Update frontend route protection
4. Update UI role checks

### Styling Customization
- Modify `client/tailwind.config.js` for theme colors
- Update `client/src/index.css` for global styles
- Customize component styles in individual files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎉 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Socket.IO team for real-time capabilities
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of this project

---

**Happy Issue Tracking! 🐛➡️✅**
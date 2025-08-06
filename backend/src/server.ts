import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectDB } from './config/database';
import { initializeSocket } from './socket/socket';

// Import routes
import authRoutes from './routes/auth';
import issueRoutes from './routes/issues';
import commentRoutes from './routes/comments';
import dashboardRoutes from './routes/dashboard';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Initialize Socket.IO
initializeSocket(io);

// Make io available to other modules
app.set('io', io);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO server initialized`);
});

export { io };
export default app;
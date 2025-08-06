import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { SOCKET_EVENTS } from '../../../shared/src/constants';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle connections
  io.on(SOCKET_EVENTS.CONNECTION, (socket: AuthenticatedSocket) => {
    console.log(`🔌 User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);
    
    // Join general updates room
    socket.join('general');

    // Handle joining issue-specific rooms
    socket.on(SOCKET_EVENTS.JOIN_ISSUE, (issueId: string) => {
      socket.join(`issue:${issueId}`);
      console.log(`📌 User ${socket.userId} joined issue room: ${issueId}`);
    });

    // Handle leaving issue-specific rooms
    socket.on(SOCKET_EVENTS.LEAVE_ISSUE, (issueId: string) => {
      socket.leave(`issue:${issueId}`);
      console.log(`📤 User ${socket.userId} left issue room: ${issueId}`);
    });

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`🔌 User ${socket.userId} disconnected`);
    });
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
};

// Utility functions for emitting events
export const emitToGeneral = (io: Server, event: string, data: any) => {
  io.to('general').emit(event, data);
};

export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

export const emitToIssue = (io: Server, issueId: string, event: string, data: any) => {
  io.to(`issue:${issueId}`).emit(event, data);
};

export const emitNotification = (io: Server, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
};
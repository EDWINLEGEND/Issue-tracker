import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import User, { IUser } from '../models/User';
import { UserRole } from '../../../shared/src/constants';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Generate JWT token
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign({ userId }, secret, { expiresIn });
};

// Verify JWT token middleware
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Token is not valid. User not found.'
        });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token is not valid.'
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
      return;
    }

    next();
  };
};

export const checkResourceOwnership = (resourceUserField: string = 'createdBy') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    next();
  };
};
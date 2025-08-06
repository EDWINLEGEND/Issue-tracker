import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../../../shared/src/constants';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
      return;
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      role: role || UserRole.VIEWER
    });

    // Generate token
    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error registering user'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
      return;
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate token
    const token = generateToken((user._id as any).toString());

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error logging in'
    });
  }
};

// Get current user profile
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting user profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    const { username, email } = req.body;
    const updates: any = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating profile'
    });
  }
};

// Get all users (Admin only)
export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting users'
    });
  }
};
import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const users = await User.find({ 
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } 
    } as any).select('-password');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { username, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: new mongoose.Types.ObjectId(userId) } 
      } as any);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user?.id;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    } as any).select('-password');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get online users
export const getOnlineUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    const users = await User.find({
      _id: { $ne: new mongoose.Types.ObjectId(currentUserId) },
      isOnline: true,
    } as any).select('-password');

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
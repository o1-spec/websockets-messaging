import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import User from '../models/User';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const authenticateSocket = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      username: string;
    };

    // Verify user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user info to socket
    socket.userId = decoded.id;
    socket.username = decoded.username;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};
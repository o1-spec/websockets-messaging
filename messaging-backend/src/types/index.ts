import { Request } from 'express';

// Extended Request type with user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Socket event types
export interface MessageData {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'video';
  fileUrl?: string;
}

export interface NotificationData {
  recipientId: string;
  type: 'message' | 'friend_request' | 'system' | 'mention';
  title: string;
  message: string;
  link?: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
  username: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
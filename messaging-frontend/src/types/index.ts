export interface User {
  _id: string;
  id?: string; // Keep for backwards compatibility
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string; // Can be populated User object or just ID string
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video';
  fileUrl?: string;
  isRead: boolean;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type: 'message' | 'friend_request' | 'system' | 'mention';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}
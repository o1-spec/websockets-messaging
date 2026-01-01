export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  USERS: {
    LIST: '/api/users',
    SEARCH: '/api/users/search',
    ONLINE: '/api/users/online',
    PROFILE: '/api/users/profile',
  },
  MESSAGES: {
    SEND: '/api/messages/send',
    LIST: '/api/messages/conversation',
    READ: '/api/messages',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    READ: '/api/notifications',
    READ_ALL: '/api/notifications/read-all',
  },
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // User status
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  
  // Conversations
  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',
  
  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_READ: 'message:read',
  
  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  TYPING_USER: 'typing:user',
  
  // Notifications
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_RECEIVE: 'notification:receive',
  
  // Errors
  ERROR: 'error',
};
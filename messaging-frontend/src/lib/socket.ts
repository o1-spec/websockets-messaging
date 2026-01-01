import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@/config/constants';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Generic emit method
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit:', event);
    }
  }

  // Generic on method
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('Socket not connected. Cannot listen to:', event);
    }
  }

  // Conversation events
  joinConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
  }

  // Message events
  sendMessage(data: {
    conversationId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
  }) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_SEND, data);
  }

  onMessageReceive(callback: (message: any) => void) {
    this.socket?.on(SOCKET_EVENTS.MESSAGE_RECEIVE, callback);
  }

  markMessageAsRead(messageId: string, conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.MESSAGE_READ, { messageId, conversationId });
  }

  // Typing events
  startTyping(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, conversationId);
  }

  stopTyping(conversationId: string) {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, conversationId);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on(SOCKET_EVENTS.TYPING_USER, callback);
  }

  onTypingStop(callback: (data: any) => void) {
    this.socket?.on(SOCKET_EVENTS.TYPING_STOP, callback);
  }

  // User status events
  onUserOnline(callback: (data: any) => void) {
    this.socket?.on(SOCKET_EVENTS.USER_ONLINE, callback);
  }

  onUserOffline(callback: (data: any) => void) {
    this.socket?.on(SOCKET_EVENTS.USER_OFFLINE, callback);
  }

  // Notification events
  sendNotification(data: {
    recipientId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }) {
    this.socket?.emit(SOCKET_EVENTS.NOTIFICATION_SEND, data);
  }

  onNotificationReceive(callback: (notification: any) => void) {
    this.socket?.on(SOCKET_EVENTS.NOTIFICATION_RECEIVE, callback);
  }

  // Error handling
  onError(callback: (error: any) => void) {
    this.socket?.on(SOCKET_EVENTS.ERROR, callback);
  }

  // Remove listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export const socketClient = new SocketClient();
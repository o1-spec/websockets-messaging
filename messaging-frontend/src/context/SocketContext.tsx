'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '@/types';

interface SocketContextType {
  isConnected: boolean;
  onlineUsers: string[];
  sendMessage: (data: {
    conversationId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
  }) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onMessageReceive: (callback: (message: Message) => void) => void;
  onTyping: (callback: (data: any) => void) => void;
  onTypingStop: (callback: (data: any) => void) => void;
  offMessageReceive: () => void;
  emitConversationCreated: (conversationId: string) => void;
  onConversationNew: (callback: (conversation: Conversation) => void) => void;
  onConversationUpdated: (callback: (conversation: Conversation) => void) => void;
  onNotification: (callback: (notification: any) => void) => void;
  offConversationNew: () => void;
  offConversationUpdated: () => void;
  offNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      const socket = socketClient.connect(token);

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Listen for user online/offline events
      socketClient.onUserOnline((data) => {
        setOnlineUsers((prev) => [...new Set([...prev, data.userId])]);
      });

      socketClient.onUserOffline((data) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      });

      // Cleanup on unmount
      return () => {
        socketClient.disconnect();
      };
    }
  }, [isAuthenticated, token]);

  const sendMessage = (data: {
    conversationId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
  }) => {
    socketClient.sendMessage(data);
  };

  const joinConversation = (conversationId: string) => {
    socketClient.joinConversation(conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketClient.leaveConversation(conversationId);
  };

  const startTyping = (conversationId: string) => {
    socketClient.startTyping(conversationId);
  };

  const stopTyping = (conversationId: string) => {
    socketClient.stopTyping(conversationId);
  };

  const onMessageReceive = (callback: (message: Message) => void) => {
    socketClient.onMessageReceive(callback);
  };

  const onTyping = (callback: (data: any) => void) => {
    socketClient.onTyping(callback);
  };

  const onTypingStop = (callback: (data: any) => void) => {
    socketClient.onTypingStop(callback);
  };

  const offMessageReceive = () => {
    socketClient.off('message:receive');
  };

  // New conversation methods
  const emitConversationCreated = (conversationId: string) => {
    socketClient.emit('conversation:created', { conversationId });
  };

  const onConversationNew = (callback: (conversation: Conversation) => void) => {
    socketClient.on('conversation:new', callback);
  };

  const onConversationUpdated = (callback: (conversation: Conversation) => void) => {
    socketClient.on('conversation:updated', callback);
  };

  const onNotification = (callback: (notification: any) => void) => {
    socketClient.on('notification:new', callback);
  };

  const offConversationNew = () => {
    socketClient.off('conversation:new');
  };

  const offConversationUpdated = () => {
    socketClient.off('conversation:updated');
  };

  const offNotification = () => {
    socketClient.off('notification:new');
  };

  const value = {
    isConnected,
    onlineUsers,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    onMessageReceive,
    onTyping,
    onTypingStop,
    offMessageReceive,
    emitConversationCreated,
    onConversationNew,
    onConversationUpdated,
    onNotification,
    offConversationNew,
    offConversationUpdated,
    offNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
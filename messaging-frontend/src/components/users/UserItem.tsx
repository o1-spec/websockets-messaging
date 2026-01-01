'use client';

import { User } from '@/types';
import OnlineStatus from './OnlineStatus';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/context/SocketContext';

interface UserItemProps {
  user: User;
  onChatCreated?: (conversationId: string) => void;
}

export default function UserItem({ user, onChatCreated }: UserItemProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { emitConversationCreated, isConnected } = useSocket();

  const handleStartChat = async () => {
    setIsCreating(true);
    setError('');
    
    const userId = user._id || user.id;
    
    if (!userId) {
      setError('User id is missing');
      setIsCreating(false);
      return;
    }
    
    try {
      console.log('Creating conversation with user:', userId);
      const response = await apiClient.createConversation([userId]);
      console.log('Conversation response:', response);
      
      const conversationId = response.conversation._id;
      
      // Only emit if it's a NEW conversation
      if (response.isNew && isConnected) {
        console.log('Emitting conversation:created event');
        emitConversationCreated(conversationId);
      } else {
        console.log('Conversation already exists, not emitting event');
      }
      
      // Notify parent component to switch tabs and select conversation
      if (onChatCreated) {
        onChatCreated(conversationId);
      }
      
      // Update URL with conversation ID
      router.push(`/chat?conversation=${conversationId}`);
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      setError(error.response?.data?.message || 'Failed to start chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <OnlineStatus isOnline={user.isOnline} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <button
          onClick={handleStartChat}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isCreating ? 'Starting...' : 'Chat'}
        </button>
      </div>
    </div>
  );
}
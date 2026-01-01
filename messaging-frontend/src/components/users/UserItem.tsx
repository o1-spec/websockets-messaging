'use client';

import { User } from '@/types';
import OnlineStatus from './OnlineStatus';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserItemProps {
  user: User;
}

export default function UserItem({ user }: UserItemProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    setIsCreating(true);
    try {
      const response = await apiClient.createConversation([user.id]);
      // Refresh the page or update state to show the new conversation
      window.location.href = '/chat';
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.username?.[0]?.toUpperCase()}
          </div>
          <OnlineStatus isOnline={user.isOnline} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.username}</h3>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleStartChat}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isCreating ? 'Starting...' : 'Chat'}
        </button>
      </div>
    </div>
  );
}
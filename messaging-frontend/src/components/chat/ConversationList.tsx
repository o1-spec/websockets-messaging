'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext';

interface ConversationListProps {
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
  searchQuery: string;
}

export default function ConversationList({
  selectedConversation,
  onSelectConversation,
  searchQuery,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { onConversationNew, onConversationUpdated, offConversationNew, offConversationUpdated } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for new conversations and updates via WebSocket
  useEffect(() => {
    const handleNewConversation = (conversation: any) => {
      console.log('📩 New conversation received:', conversation);
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    };

    const handleConversationUpdated = (conversation: any) => {
      console.log('🔄 Conversation updated:', conversation);
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? conversation : c))
      );
    };

    onConversationNew(handleNewConversation);
    onConversationUpdated(handleConversationUpdated);

    return () => {
      offConversationNew();
      offConversationUpdated();
    };
  }, [onConversationNew, onConversationUpdated, offConversationNew, offConversationUpdated]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation.participants || conversation.participants.length === 0) {
      return null;
    }
    
    return conversation.participants.find(
      (p: any) => p._id !== currentUser?._id
    ) || conversation.participants[0];
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = getOtherParticipant(conv);
    if (!searchQuery.trim()) return true;
    return otherParticipant?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm mt-2 text-center">Go to Users tab to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredConversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isSelected = selectedConversation?._id === conversation._id;

        return (
          <div
            key={conversation._id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {otherParticipant?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                {otherParticipant?.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherParticipant?.username || 'Unknown User'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.lastMessage?.createdAt
                      ? formatDate(conversation.lastMessage.createdAt)
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
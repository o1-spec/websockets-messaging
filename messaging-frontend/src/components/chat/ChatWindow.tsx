'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useMessages } from '@/hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  conversation: any;
  onToggleSidebar: () => void;
}

export default function ChatWindow({ conversation, onToggleSidebar }: ChatWindowProps) {
  const { joinConversation, leaveConversation, onMessageReceive, offMessageReceive } = useSocket();
  const { messages, addMessage } = useMessages(conversation?._id);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (conversation?._id) {
      joinConversation(conversation._id);

      // Listen for new messages
      const handleNewMessage = (message: any) => {
        if (message.conversationId === conversation._id) {
          addMessage(message);
        }
      };

      onMessageReceive(handleNewMessage);

      return () => {
        leaveConversation(conversation._id);
        offMessageReceive();
      };
    }
  }, [conversation?._id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-24 h-24 text-gray-400 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Select a conversation
        </h3>
        <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
      </div>
    );
  }

  const participant = conversation.participants[0];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {participant?.username?.[0]?.toUpperCase()}
            </div>
            {participant?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{participant?.username}</h2>
            <p className="text-xs text-gray-500">
              {participant?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Typing Indicator */}
      {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

      {/* Input */}
      <MessageInput conversationId={conversation._id} />
    </div>
  );
}
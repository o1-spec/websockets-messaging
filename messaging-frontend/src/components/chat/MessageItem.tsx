'use client';

import { useAuth } from '@/hooks/useAuth';
import { formatTime } from '@/lib/utils';
import { Message, User } from '@/types';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  
  // Type guard to check if sender is a User object
  const sender = typeof message.sender === 'string' ? null : message.sender;
  const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
  
  const isOwnMessage = senderId === user?._id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && sender && (
          <p className="text-xs font-semibold mb-1 text-gray-700">
            {sender.username}
          </p>
        )}
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <p
            className={`text-xs ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
          {isOwnMessage && message.isRead && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-blue-100"
              aria-label="Read"
            >
              <title>Read</title>
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
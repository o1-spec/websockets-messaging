'use client';

import { useAuth } from '@/hooks/useAuth';
import { formatTime } from '@/lib/utils';
import { Message } from '@/types';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  const isOwnMessage = message.sender.id === user?.id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        {!isOwnMessage && (
          <p className="text-xs font-semibold mb-1">{message.sender.username}</p>
        )}
        <p className="wrap-break-word">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
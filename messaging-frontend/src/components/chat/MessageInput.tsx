'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = (value: string) => {
    setMessage(value);

    if (value.length > 0 && !isTyping) {
      startTyping(conversationId);
      setIsTyping(true);
    } else if (value.length === 0 && isTyping) {
      stopTyping(conversationId);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      sendMessage({
        conversationId,
        content: message.trim(),
        messageType: 'text',
      });
      setMessage('');
      stopTyping(conversationId);
      setIsTyping(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}
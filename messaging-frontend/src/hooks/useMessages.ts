import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Message } from '@/types';

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getMessages(conversationId);
      setMessages(response.messages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    updateMessage,
  };
};
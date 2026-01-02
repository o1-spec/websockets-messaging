'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversation: any;
  onBack?: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messageListenerAttached = useRef(false);

  // Get other participant
  const otherParticipant = conversation?.participants?.find(
    (p: any) => p._id !== localStorage.getItem('userId')
  );

  // Fetch messages
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getMessages(conversation._id);
        console.log('Messages fetched:', response.messages?.length || 0);
        setMessages(response.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversation?._id]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!conversation?._id) return;

    // Join the conversation room
    socketClient.emit('conversation:join', conversation._id);
    console.log('Joined conversation:', conversation._id);

    // Prevent duplicate listeners
    if (messageListenerAttached.current) {
      console.log('Message listener already attached');
      return;
    }

    const handleNewMessage = (message: any) => {
      console.log('New message received:', message);
      
      // Only add if message belongs to this conversation
      if (message.conversationId === conversation._id) {
        setMessages((prevMessages) => {
          // Check if message already exists (prevent duplicates)
          const messageExists = prevMessages.some((m) => m._id === message._id);
          if (messageExists) {
            console.log('Message already exists, skipping:', message._id);
            return prevMessages;
          }
          console.log('Adding new message to list');
          return [...prevMessages, message];
        });
      }
    };

    socketClient.on('message:receive', handleNewMessage);
    messageListenerAttached.current = true;
    console.log('Message listener attached');

    // Cleanup
    return () => {
      console.log('Cleaning up message listener and leaving conversation');
      socketClient.off('message:receive', handleNewMessage);
      socketClient.emit('conversation:leave', conversation._id);
      messageListenerAttached.current = false;
    };
  }, [conversation?._id]);

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversation?._id || isSending) return;

    setIsSending(true);
    try {
      console.log('Sending message:', content);
      
      // Send via socket (don't add to state here, wait for socket response)
      socketClient.emit('message:send', {
        conversationId: conversation._id,
        content: content.trim(),
        messageType: 'text',
      });

      console.log('Message sent via socket');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
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
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          )}
          
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {otherParticipant?.username?.[0]?.toUpperCase() || '?'}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherParticipant?.username || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {otherParticipant?.isOnline ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} />
          <MessageInput onSend={handleSendMessage} disabled={isSending} />
        </>
      )}
    </div>
  );
}
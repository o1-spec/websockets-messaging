'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import ConversationList from './ConversationList';
import UserList from '../users/UserList';
import NotificationBell from '../notifications/NotificationBell';

interface ChatSidebarProps {
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
  onClose: () => void;
}

export default function ChatSidebar({
  selectedConversation,
  onSelectConversation,
  onClose,
}: ChatSidebarProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'conversations' | 'users'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{user?.username}</h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-600 transition"
              title="Logout"
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'conversations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'conversations' ? (
          <ConversationList
            selectedConversation={selectedConversation}
            onSelectConversation={onSelectConversation}
            searchQuery={searchQuery}
          />
        ) : (
          <UserList searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
'use client';

import { useUsers } from '@/hooks/useUsers';
import UserItem from './UserItem';

interface UserListProps {
  searchQuery: string;
  onChatCreated?: (conversationId: string) => void;
}

export default function UserList({ searchQuery, onChatCreated }: UserListProps) {
  const { users, isLoading, error } = useUsers();

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredUsers.map((user) => (
        <UserItem key={user._id || user.id} user={user} onChatCreated={onChatCreated} />
      ))}
    </div>
  );
}
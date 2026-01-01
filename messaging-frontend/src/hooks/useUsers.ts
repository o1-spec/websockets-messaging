import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User } from '@/types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchOnlineUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUsers();
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await apiClient.getOnlineUsers();
      setOnlineUsers(response.users);
    } catch (err: any) {
      console.error('Failed to fetch online users:', err);
    }
  };

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.searchUsers(query);
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    onlineUsers,
    isLoading,
    error,
    fetchUsers,
    fetchOnlineUsers,
    searchUsers,
  };
};
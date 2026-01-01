'use client';

import { useNotification } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Notification } from '@/types';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotification();
  const router = useRouter();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification._id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
          {notification.sender?.username?.[0]?.toUpperCase() || 'N'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(notification.createdAt)}
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
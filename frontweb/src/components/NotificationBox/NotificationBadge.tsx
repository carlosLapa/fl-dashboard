import React from 'react';
import { useNotification } from '../../NotificationContext';
import { Notification } from 'types/notification';

interface NotificationBadgeProps {
  userId: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ userId }) => {
  const { notifications } = useNotification();
  const unreadCount = notifications.filter(
    (notification: Notification) =>
      !notification.isRead && notification.user?.id === userId
  ).length;

  return unreadCount > 0 ? (
    <span className="notification-badge">{unreadCount}</span>
  ) : null;
};

export default NotificationBadge;

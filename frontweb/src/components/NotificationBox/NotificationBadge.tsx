import React from 'react';
import { useNotification } from '../../NotificationContext';
import { Notification } from 'types/notification';
import './styles.css';

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
    <div className="notification-badge-container">
      <span className="notification-badge">{unreadCount}</span>
    </div>
  ) : null;
};

export default NotificationBadge;

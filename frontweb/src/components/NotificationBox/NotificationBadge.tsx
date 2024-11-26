import React from 'react';
import { useNotification } from '../../NotificationContext';
import { Notification, NotificationType } from 'types/notification';
import './styles.css';

interface NotificationBadgeProps {
  userId: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ userId }) => {
  const { notifications } = useNotification();
  const unreadCount = notifications.filter(
    (notification: Notification) =>
      !notification.isRead &&
      notification.user?.id === userId &&
      Object.values(NotificationType).includes(
        notification.type as NotificationType
      )
  ).length;

  return unreadCount > 0 ? (
    <span className="notification-badge">{unreadCount}</span>
  ) : null;
};

export default NotificationBadge;

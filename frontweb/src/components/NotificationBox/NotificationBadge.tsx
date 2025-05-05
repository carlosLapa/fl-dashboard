import React from 'react';
import { useNotification } from '../../NotificationContext';
import { Notification, NotificationType } from 'types/notification';
import './styles.scss';

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

  // If count is greater than 99, display 99+
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return unreadCount > 0 ? (
    <span
      className="notification-badge"
      aria-label={`${unreadCount} unread notifications`}
    >
      {displayCount}
    </span>
  ) : null;
};

export default NotificationBadge;

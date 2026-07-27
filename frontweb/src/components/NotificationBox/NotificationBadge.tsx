import React from 'react';
import './styles.scss';

interface NotificationBadgeProps {
  unreadCount: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  unreadCount,
}) => {
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
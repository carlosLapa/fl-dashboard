import React from 'react';
import { useNotification } from '../../NotificationContext';
import NotificationDisplay from './NotificationDisplay';

const NotificationList: React.FC = () => {
  const { notifications, handleMarkAsRead } = useNotification();

  return (
    <div className="notification-list" role="list">
      {notifications.map((notification) => (
        <NotificationDisplay
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationList;

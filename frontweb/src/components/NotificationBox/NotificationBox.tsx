import React, { useEffect, useState } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { useNotification } from '../../NotificationContext';
import NotificationDisplay from './NotificationDisplay';
import { NotificationType } from 'types/notification';
import './styles.css';

interface NotificationBoxProps {
  userId: number;
}

const NotificationBox: React.FC<NotificationBoxProps> = ({ userId }) => {
  const {
    notifications,
    loadStoredNotifications,
    handleNewNotification,
    handleMarkAsRead,
  } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { messages } = useWebSocket(userId);

  useEffect(() => {
    const loadInitialNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await loadStoredNotifications(userId);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (
        Object.values(NotificationType).includes(
          latestMessage.type as NotificationType
        )
      ) {
        handleNewNotification(latestMessage);
      }
    }
  }, [messages, handleNewNotification]);

  if (isLoading) return <p>Loading notifications...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="notification-container">
      <div className="notifications-list">
        {isLoading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : error ? (
          <div className="notification-error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">No notifications</div>
        ) : (
          notifications.map((notification, index) => (
            <NotificationDisplay
              key={`notification-${notification.id || index}`}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBox;

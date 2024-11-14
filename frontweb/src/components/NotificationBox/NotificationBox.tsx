import React, { useEffect, useState } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { useNotification } from '../../NotificationContext';
import NotificationDisplay from './NotificationDisplay';
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

  const {
    isConnected,
    messages,
    sendMessage,
    removeSubscription,
    connectionError,
    clearMessages,
    connectionStats,
    reconnect,
  } = useWebSocket(userId);

  useEffect(() => {
    const loadInitialNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await loadStoredNotifications(userId);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error loading notifications:', err);
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
      handleNewNotification(latestMessage);
    }
  }, [messages, handleNewNotification]);

  useEffect(() => {
    return () => {
      removeSubscription(`/topic/notifications/${userId}`);
      clearMessages();
    };
  }, [clearMessages, removeSubscription, userId]);

  const handleSendNotification = () => {
    const notification = {
      type: 'GENERAL_NOTIFICATION',
      content: 'This is a test notification',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: null,
      userId: userId,
      tarefaId: 10,
      projetoId: 5,
    };

    sendMessage({
      type: 'NOTIFICATION',
      content: notification,
    });
  };

  return (
    <div className="notification-container">
      <div className="notification-box">
        <div className="connection-status">
          <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
          <p>Messages sent: {connectionStats.messagesSent}</p>
          <p>Messages received: {connectionStats.messagesReceived}</p>
          <p>Queue size: {connectionStats.queueSize}</p>
        </div>

        {connectionError && (
          <div className="error-container">
            <p className="error-message">{connectionError}</p>
            <button onClick={reconnect} className="reconnect-btn">
              Retry Connection
            </button>
          </div>
        )}

        {!isConnected && <p>Please check your connection or token validity.</p>}

        <button
          onClick={handleSendNotification}
          className="send-notification-btn"
          disabled={!isConnected}
        >
          Send Test Notification
        </button>
      </div>

      <div className="notifications-list" role="list">
        {Array.isArray(notifications) ? (
          notifications.length === 0 ? (
            <p className="no-notifications">No notifications</p>
          ) : (
            notifications.map((notification, index) => (
              <NotificationDisplay
                key={`notification-${index}`}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )
        ) : (
          <p>Loading notifications...</p>
        )}
      </div>
    </div>
  );
};

export default NotificationBox;

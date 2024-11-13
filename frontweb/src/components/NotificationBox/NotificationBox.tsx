import React, { useEffect, useState } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { useNotification } from '../../NotificationContext';
import { Notification } from 'types/notification';
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
  const [originalMessages, setOriginalMessages] = useState<Notification[]>([]);
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
    loadStoredNotifications(userId);
  }, [userId, loadStoredNotifications]);

  const convertToDisplayNotification = (
    notification: Notification,
    index: number
  ): Notification => {
    const originalMessage = originalMessages[index];
    return {
      ...notification,
      tarefa: {
        id: notification.tarefa?.id || 0,
        descricao: originalMessage?.tarefa?.descricao || 'Teste 2',
      },
      projeto: {
        id: notification.projeto?.id || 0,
        designacao:
          originalMessage?.projeto?.designacao || 'P-02 Lidl Alcântara',
      },
    };
  };

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setOriginalMessages((prev) => [...prev, latestMessage]);
      handleNewNotification(latestMessage);
    }
  }, [messages, handleNewNotification]);

  useEffect(() => {
    return () => {
      removeSubscription(`/topic/notifications/${userId}`);
      clearMessages();
    };
  }, [removeSubscription, clearMessages, userId]);

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
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications</p>
        ) : (
          notifications.map((notification, index) => (
            <NotificationDisplay
              key={`notification-${index}`}
              notification={convertToDisplayNotification(notification, index)}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBox;

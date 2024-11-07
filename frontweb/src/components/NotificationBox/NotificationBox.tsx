import React, { useEffect } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { useNotification } from '../../NotificationContext';
import { NotificationInsertDTO } from 'types/notification';
import './styles.css';

const NotificationBox: React.FC = () => {
  const { handleNewNotification } = useNotification();
  const {
    isConnected,
    messages,
    sendMessage,
    removeSubscription,
    connectionError,
    clearMessages,
    connectionStats,
    reconnect,
  } = useWebSocket();

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      handleNewNotification(latestMessage);
    }
  }, [messages, handleNewNotification]);

  useEffect(() => {
    return () => {
      removeSubscription('/topic/notifications');
      clearMessages();
    };
  }, [removeSubscription, clearMessages]);

  const handleSendNotification = () => {
    const notification: NotificationInsertDTO = {
      type: 'GENERAL_NOTIFICATION',
      content: 'This is a test notification',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: null,
      userId: 1,
      tarefaId: 10,
      projetoId: 5,
    };
    sendMessage({ type: 'NOTIFICATION', content: notification });
  };

  return (
    <div className="notification-box">
      <h2>Notifications Control Panel</h2>
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
  );
};

export default NotificationBox;

import React, { useEffect, useState } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { Notification, NotificationInsertDTO } from 'types/notification';
import NotificationDisplay from './NotificationDisplay';
import './styles.css';

interface NotificationBoxProps {
  userId: number;
}

const NotificationBox: React.FC<NotificationBoxProps> = ({ userId }) => {
  const [displayedNotifications, setDisplayedNotifications] = useState<
    NotificationInsertDTO[]
  >([]);
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

  const convertToNotificationInsertDTO = (
    notification: Notification
  ): NotificationInsertDTO => {
    return {
      type: notification.type,
      content: notification.content,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      relatedId: notification.relatedId,
      userId: notification.user?.id || 0,
      tarefaId: notification.tarefa?.id || 0,
      projetoId: notification.projeto?.id || 0,
    };
  };

  const convertToDisplayNotification = (
    dto: NotificationInsertDTO,
    index: number
  ): Notification => {
    const originalMessage = originalMessages[index];
    return {
      id: dto.userId,
      type: dto.type,
      content: dto.content,
      isRead: dto.isRead,
      createdAt: dto.createdAt,
      relatedId: dto.relatedId,
      user: {
        id: dto.userId,
        name: `User ${dto.userId}`,
      },
      tarefa: {
        id: dto.tarefaId,
        descricao: originalMessage?.tarefa?.descricao || 'Teste 2',
      },
      projeto: {
        id: dto.projetoId,
        designacao:
          originalMessage?.projeto?.designacao || 'P-02 Lidl Alcântara',
      },
    };
  };

  const handleMarkAsRead = (userId: number) => {
    setDisplayedNotifications((prev) =>
      prev.map((notification) =>
        notification.userId === userId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setOriginalMessages((prev) => [...prev, latestMessage]);
      const convertedMessage = convertToNotificationInsertDTO(latestMessage);
      setDisplayedNotifications((prev) => [...prev, convertedMessage]);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      removeSubscription(`/topic/notifications/${userId}`);
      clearMessages();
    };
  }, [removeSubscription, clearMessages, userId]);

  const handleSendNotification = () => {
    const notification: NotificationInsertDTO = {
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
        {displayedNotifications.length === 0 ? (
          <p className="no-notifications">No notifications</p>
        ) : (
          displayedNotifications.map((notification, index) => (
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

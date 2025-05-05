import React, { useEffect, useState } from 'react';
import useWebSocket from 'hooks/useWebSocketMessage';
import { useNotification } from '../../NotificationContext';
import NotificationDisplay from './NotificationDisplay';
import { NotificationType } from 'types/notification';
import { ResourceNotFoundException } from '../../types/exceptions';
import { toast } from 'react-toastify';
import './styles.scss';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Add responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        try {
          handleNewNotification(latestMessage);
          // Only show toast if notification handling succeeds
          toast.info(`Nova notificação: ${latestMessage.content}`, {
            position: isMobile ? 'bottom-center' : 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (error) {
          // Silently handle expected race condition errors
          if (!(error instanceof ResourceNotFoundException)) {
            console.error('Unexpected error handling notification:', error);
          }
        }
      }
    }
  }, [messages, handleNewNotification, isMobile]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => {
    if (!n.isRead) return false;
    // Filter out notifications older than 7 days - adjust here if needed
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(n.createdAt) > sevenDaysAgo;
  });

  if (isLoading) {
    return (
      <div
        className="notification-container"
        style={{ gridTemplateColumns: '1fr' }}
      >
        <div className="notifications-section">
          <h2 className="notifications-title">Carregando notificações...</h2>
          <div className="notifications-list">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="notification-card"
                style={{ opacity: 0.7 }}
              >
                <div
                  className="loading-placeholder"
                  style={{ width: '60%' }}
                ></div>
                <div
                  className="loading-placeholder"
                  style={{ width: '80%' }}
                ></div>
                <div
                  className="loading-placeholder"
                  style={{ width: '40%' }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="notification-container"
        style={{ gridTemplateColumns: '1fr' }}
      >
        <div className="notification-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="notification-container">
      {/* Unread Notifications Section */}
      <div className="notifications-section">
        <h2 className="notifications-title">
          Novas Notificações ({unreadNotifications.length})
        </h2>
        <div className="notifications-list">
          {unreadNotifications.length === 0 ? (
            <div className="notification-empty">Sem novas notificações</div>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationDisplay
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
      {/* Read Notifications Section */}
      <div className="notifications-section">
        <h2 className="notifications-title">
          Notificações Anteriores ({readNotifications.length})
        </h2>
        <div className="notifications-list">
          {readNotifications.length === 0 ? (
            <div className="notification-empty">
              Sem notificações anteriores
            </div>
          ) : (
            readNotifications.map((notification) => (
              <NotificationDisplay
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBox;

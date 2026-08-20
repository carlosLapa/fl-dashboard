import React, { useEffect, useState } from 'react';
import { useNotification } from '../../NotificationContext';
import NotificationDisplay from './NotificationDisplay';
import './styles.scss';

interface NotificationBoxProps {
  userId: number;
}

const PAGE_SIZE = 20;

const NotificationBox: React.FC<NotificationBoxProps> = ({ userId }) => {
  const {
    notifications,
    loadStoredNotifications,
    hasMore,
    resetNotifications,
    handleMarkAsRead,
  } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // Reset notifications and page when userId changes
    resetNotifications();
    setPage(0);
  }, [userId, resetNotifications]);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await loadStoredNotifications(userId, page, PAGE_SIZE);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, page]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => {
    if (!n.isRead) return false;
    // Filter out notifications older than 7 days - adjust here if needed
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(n.createdAt) > sevenDaysAgo;
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  if (isLoading && page === 0) {
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
      {/* Load More Button */}
      {hasMore && (
        <div className="load-more-container">
          <button className="load-more-button" onClick={handleLoadMore}>
            Carregar mais notificações
          </button>
        </div>
      )}
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

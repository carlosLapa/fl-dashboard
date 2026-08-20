import React, { useEffect, useState } from 'react';
import { useNotification } from '../../NotificationContext';
import {
  markMultipleNotificationsAsReadAPI,
  deleteAllReadNotificationsAPI,
} from 'api/notificationsApi';
import { toast } from 'react-toastify';
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
    handleMarkMultipleAsRead,
    handleDeleteAllRead,
  } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isDeletingAllRead, setIsDeletingAllRead] = useState(false);
  const [showDeleteAllReadConfirm, setShowDeleteAllReadConfirm] =
    useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleMarkAllAsRead = async () => {
    const ids = unreadNotifications.map((n) => n.id);
    if (ids.length === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      await markMultipleNotificationsAsReadAPI(ids);
      handleMarkMultipleAsRead(ids);
      toast.success('Notificações marcadas como lidas', {
        position: isMobile ? 'bottom-center' : 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      toast.error('Erro ao marcar notificações como lidas', {
        position: isMobile ? 'bottom-center' : 'top-right',
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDeleteAllReadConfirmed = async () => {
    if (isDeletingAllRead) return;

    setIsDeletingAllRead(true);
    try {
      await deleteAllReadNotificationsAPI(userId);
      handleDeleteAllRead();
      toast.success('Notificações anteriores apagadas', {
        position: isMobile ? 'bottom-center' : 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      toast.error('Erro ao apagar notificações anteriores', {
        position: isMobile ? 'bottom-center' : 'top-right',
      });
    } finally {
      setIsDeletingAllRead(false);
      setShowDeleteAllReadConfirm(false);
    }
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
        <div className="notifications-section-header">
          <h2 className="notifications-title">
            Novas Notificações ({unreadNotifications.length})
          </h2>
          {unreadNotifications.length > 0 && (
            <button
              className="mark-all-read-button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? 'A processar...' : 'Marcar todas como lidas'}
            </button>
          )}
        </div>
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
        <div className="notifications-section-header">
          <h2 className="notifications-title">
            Notificações Anteriores ({readNotifications.length})
          </h2>
          {readNotifications.length > 0 &&
            (showDeleteAllReadConfirm ? (
              <div className="delete-all-read-confirm">
                <span>
                  Apaga todas as notificações lidas, incluindo as anteriores
                  a 7 dias. Confirmar?
                </span>
                <button
                  className="delete-all-read-button delete-all-read-button--confirm"
                  onClick={handleDeleteAllReadConfirmed}
                  disabled={isDeletingAllRead}
                >
                  {isDeletingAllRead ? 'A apagar...' : 'Confirmar'}
                </button>
                <button
                  className="delete-all-read-button delete-all-read-button--cancel"
                  onClick={() => setShowDeleteAllReadConfirm(false)}
                  disabled={isDeletingAllRead}
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                className="delete-all-read-button"
                onClick={() => setShowDeleteAllReadConfirm(true)}
                title="Apaga todas as notificações lidas, incluindo as anteriores a 7 dias"
              >
                Apagar todas
              </button>
            ))}
        </div>
        {readNotifications.length > 0 && (
          <p className="notifications-auto-cleanup-hint">
            As notificações lidas são apagadas automaticamente ao fim de 3
            dias.
          </p>
        )}
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

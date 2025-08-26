import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Notification,
  NotificationInsertDTO,
  NotificationType,
} from 'types/notification';
import useWebSocket from 'hooks/useWebSocketMessage';
import {
  getNotificationDetailsAPI,
  PaginatedNotifications,
} from 'api/notificationsApi';
import secureStorage from './auth/secureStorage';

interface NotificationContextType {
  notifications: Notification[];
  handleNewNotification: (notification: Notification) => void;
  handleMarkAsRead: (id: number) => void;
  sendNotification: (notification: NotificationInsertDTO) => void;
  loadStoredNotifications: (
    userId: number,
    page?: number,
    size?: number
  ) => Promise<PaginatedNotifications | undefined>;
  unreadCount: number;
  hasMore: boolean;
  resetNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userId: number;
}> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Reset notifications (for new user or reload)
  const resetNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setHasMore(true);
  }, []);

  // Pagination-aware loader
  const loadStoredNotifications = async (
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedNotifications | undefined> => {
    const token = secureStorage.getItem('access_token');
    if (!token || userId === 0) return;

    try {
      const detailedNotifications: PaginatedNotifications | undefined =
        await getNotificationDetailsAPI(userId, page, size);

      // Defensive check for content existence
      if (
        !detailedNotifications ||
        !Array.isArray(detailedNotifications.content)
      ) {
        setNotifications([]);
        setUnreadCount(0);
        return undefined;
      }

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = detailedNotifications.content.filter(
          (n) => !existingIds.has(n.id)
        );
        const updated = [...prev, ...newItems];
        setUnreadCount(updated.filter((n) => !n.isRead).length);
        return updated;
      });

      setHasMore(page + 1 < detailedNotifications.totalPages);

      return detailedNotifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      return undefined;
    }
  };

  const handleNewNotification = useCallback((notification: Notification) => {
    if (
      Object.values(NotificationType).includes(
        notification.type as NotificationType
      )
    ) {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === notification.id);
        return exists ? prev : [...prev, notification];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const { messages, sendMessage } = useWebSocket(userId);

  const sendNotification = useCallback(
    (notification: NotificationInsertDTO) => {
      if (
        Object.values(NotificationType).includes(
          notification.type as NotificationType
        )
      ) {
        const message = {
          type: 'NOTIFICATION',
          content: notification,
        };
        sendMessage(message);
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    messages.forEach((message) => {
      handleNewNotification(message);
    });
  }, [messages, handleNewNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        handleNewNotification,
        handleMarkAsRead,
        sendNotification,
        loadStoredNotifications,
        hasMore,
        resetNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

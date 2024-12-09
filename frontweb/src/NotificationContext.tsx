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
import { getNotificationDetailsAPI } from 'api/requestsApi';

interface NotificationContextType {
  notifications: Notification[];
  handleNewNotification: (notification: Notification) => void;
  handleMarkAsRead: (id: number) => void;
  sendNotification: (notification: NotificationInsertDTO) => void;
  loadStoredNotifications: (userId: number) => Promise<void>;
  unreadCount: number;
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

  const loadStoredNotifications = async (userId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token || userId === 0) return;

    try {
      const detailedNotifications = await getNotificationDetailsAPI(userId);
      setNotifications(detailedNotifications);
      setUnreadCount(detailedNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNewNotification = useCallback((notification: Notification) => {
    if (
      Object.values(NotificationType).includes(
        notification.type as NotificationType
      )
    ) {
      setNotifications((prev) => [...prev, notification]);
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

  useEffect(() => {
    loadStoredNotifications(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        handleNewNotification,
        handleMarkAsRead,
        sendNotification,
        loadStoredNotifications,
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

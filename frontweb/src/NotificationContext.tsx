import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Notification, NotificationInsertDTO } from 'types/notification';
import useWebSocket from 'hooks/useWebSocketMessage';
import { getNotificationDetailsAPI } from 'api/requestsApi';

interface NotificationContextType {
  notifications: Notification[];
  handleNewNotification: (notification: Notification) => void;
  handleMarkAsRead: (id: number) => void;
  sendNotification: (notification: NotificationInsertDTO) => void;
  loadStoredNotifications: (userId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userId: number;
}> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadStoredNotifications = async (userId: number) => {
    try {
      const detailedNotifications = await getNotificationDetailsAPI(userId);
      setNotifications(detailedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const handleMarkAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const { messages, sendMessage } = useWebSocket(userId);

  const sendNotification = useCallback(
    (notification: NotificationInsertDTO) => {
      const message = {
        type: 'NOTIFICATION',
        content: notification,
      };
      sendMessage(message);
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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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

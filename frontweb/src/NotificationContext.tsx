import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, NotificationInsertDTO } from 'types/notification';

interface NotificationContextType {
  notifications: Notification[];
  handleNewNotification: (notification: Notification) => void;
  handleMarkAsRead: (id: number) => void;
  sendNotification: (notification: NotificationInsertDTO) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  const sendNotification = useCallback(
    (notification: NotificationInsertDTO) => {
      // WebSocket send logic will be handled by components
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        handleNewNotification,
        handleMarkAsRead,
        sendNotification,
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

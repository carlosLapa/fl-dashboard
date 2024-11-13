import React from 'react';
import { Notification, NotificationInsertDTO } from 'types/notification';

interface NotificationDisplayProps {
  notification: Notification | NotificationInsertDTO;
  onMarkAsRead: (id: number) => void;
}

const isNotification = (
  notification: Notification | NotificationInsertDTO
): notification is Notification => {
  return 'tarefa' in notification && 'projeto' in notification;
};

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const handleMarkAsRead = () => {
    if (isNotification(notification)) {
      onMarkAsRead(notification.id);
    } else {
      onMarkAsRead(notification.userId);
    }
  };

  return (
    <div
      className={`notification ${notification.isRead ? 'read' : 'unread'}`}
      role="listitem"
    >
      <h3>{notification.type}</h3>
      <p>{notification.content}</p>
      <small>{new Date(notification.createdAt).toLocaleString()}</small>
      {isNotification(notification) && (
        <>
          {notification.tarefa && (
            <p className="notification-detail">
              Tarefa: {notification.tarefa.descricao}
            </p>
          )}
          {notification.projeto && (
            <p className="notification-detail">
              Projeto: {notification.projeto.designacao}
            </p>
          )}
        </>
      )}
      <button
        onClick={handleMarkAsRead}
        aria-label={`Mark notification as read: ${notification.content}`}
      >
        Mark as Read
      </button>
    </div>
  );
};

export default React.memo(NotificationDisplay);

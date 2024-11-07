import React from 'react';
import { Notification } from 'types/notification';

interface NotificationDisplayProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  notification,
  onMarkAsRead,
}) => {
  return (
    <div className={`notification ${notification.isRead ? 'read' : 'unread'}`}>
      <h3>{notification.type}</h3>
      <p>{notification.content}</p>
      <small>{new Date(notification.createdAt).toLocaleString()}</small>
      {notification.tarefa && <p>Tarefa: {notification.tarefa.descricao}</p>}
      {notification.projeto && (
        <p>Projeto: {notification.projeto.designacao}</p>
      )}
      <button onClick={() => onMarkAsRead(notification.id)}>
        Mark as Read
      </button>
    </div>
  );
};

export default NotificationDisplay;

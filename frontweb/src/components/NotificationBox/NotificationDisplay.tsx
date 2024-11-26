import React from 'react';
import { Notification, NotificationInsertDTO } from 'types/notification';
import { markNotificationAsReadAPI } from 'api/requestsApi';

interface NotificationDisplayProps {
  notification: Notification | NotificationInsertDTO;
  onMarkAsRead: (id: number) => void;
}

const isNotification = (
  notification: Notification | NotificationInsertDTO
): notification is Notification => {
  return 'tarefa' in notification && 'projeto' in notification;
};

const getNotificationColor = (type: string) => {
  const colors: { [key: string]: string } = {
    TASK_ASSIGNED: '#BFDBFE', // Light blue like IN_PROGRESS
    TASK_UPDATED: '#DDD6FE', // Light purple like IN_REVIEW
    TASK_COMPLETED: '#BBF7D0', // Light green like DONE
    PROJECT_UPDATED: '#FEF3C7', // Light yellow like TODO
    DEFAULT: '#E2E8F0', // Light gray like BACKLOG
  };
  return colors[type] || colors.DEFAULT;
};

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const handleMarkAsRead = async () => {
    if (isNotification(notification)) {
      await markNotificationAsReadAPI(notification.id);
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className="notification-card"
      style={{
        backgroundColor: getNotificationColor(notification.type),
        opacity: notification.isRead ? 0.7 : 1,
      }}
      role="listitem"
    >
      <div className="notification-header">
        <h3 className="notification-type">{notification.type}</h3>
        <span className="notification-date">
          {new Date(notification.createdAt).toLocaleDateString('pt-PT')}
        </span>
      </div>

      <p className="notification-content">{notification.content}</p>

      {isNotification(notification) && (
        <div className="notification-details">
          {notification.tarefa && (
            <div className="notification-detail">
              Tarefa: {notification.tarefa.descricao}
            </div>
          )}
          {notification.projeto && (
            <div className="notification-detail">
              Projeto: {notification.projeto.designacao}
            </div>
          )}
        </div>
      )}

      {!notification.isRead && (
        <button
          onClick={handleMarkAsRead}
          className="mark-read-button"
          aria-label={`Mark notification as read: ${notification.content}`}
        >
          Marcar como lida
        </button>
      )}
    </div>
  );
};

export default React.memo(NotificationDisplay);

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

const getNotificationTitle = (type: string) => {
  const titles: { [key: string]: string } = {
    GENERAL_NOTIFICATION: 'Notificação Geral',
    TAREFA_STATUS_ALTERADO: 'Estado da Tarefa Alterado',
    TASK_ASSIGNED: 'Nova Tarefa Atribuída',
    TASK_UPDATED: 'Tarefa Atualizada',
    TASK_COMPLETED: 'Tarefa Concluída',
    PROJECT_UPDATED: 'Projeto Atualizado',
  };
  return titles[type] || type;
};

const translateStatus = (status: string) => {
  const statusTranslations: { [key: string]: string } = {
    BACKLOG: '"Backlog"',
    TODO: '"A Fazer"',
    IN_PROGRESS: '"Em Progresso"',
    IN_REVIEW: '"Em Revisão"',
    DONE: '"Concluído"',
  };
  return statusTranslations[status] || status;
};

const formatNotificationContent = (content: string) => {
  return content.replace(
    /(BACKLOG|TODO|IN_PROGRESS|IN_REVIEW|DONE)/g,
    (match) => translateStatus(match)
  );
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
        <h3 className="notification-type">
          {getNotificationTitle(notification.type)}
        </h3>
        <span className="notification-date">
          {new Date(notification.createdAt).toLocaleDateString('pt-PT')}
        </span>
      </div>

      <p className="notification-content">
        {formatNotificationContent(notification.content)}
      </p>

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

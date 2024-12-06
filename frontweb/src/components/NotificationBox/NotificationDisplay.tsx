import React, { useCallback } from 'react';
import { Notification, NotificationInsertDTO } from 'types/notification';
import { markNotificationAsReadAPI } from 'api/requestsApi';
import { toast } from 'react-toastify';

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
    NOTIFICACAO_GERAL: '#CBD5E1',
    TAREFA_ATRIBUIDA: '#BFDBFE',
    TAREFA_STATUS_ALTERADO: '#DDD6FE',
    TAREFA_PRAZO_PROXIMO: '#FF2C20',
    TAREFA_CONCLUIDA: '#BBF7D0',
    TAREFA_EDITADA: '#DDD6FE',
    TAREFA_REMOVIDA: '#FECACA',
    PROJETO_ATRIBUIDO: '#FEF3C7',
    PROJETO_STATUS_ALTERADO: '#E9D5FF',
    PROJETO_EDITADO: '#FEF3C7',
    PROJETO_ATUALIZADO: '#FEF3C7',
    PROJETO_CONCLUIDO: '#BBF7D0',
    PROJETO_REMOVIDO: '#FECACA'
    //DEFAULT: '#E2E8F0',
  };
  return colors[type] || colors.DEFAULT;
};

const getNotificationTitle = (type: string) => {
  const titles: { [key: string]: string } = {
    NOTIFICACAO_GERAL: 'Notificação Geral',
    TAREFA_ATRIBUIDA: 'Nova Tarefa Atribuída',
    TAREFA_STATUS_ALTERADO: 'Estado da Tarefa Alterado',
    TAREFA_PRAZO_PROXIMO: 'Prazo de Tarefa Próximo',
    TAREFA_CONCLUIDA: 'Tarefa Concluída',
    TAREFA_EDITADA: 'Tarefa Atualizada',
    TAREFA_REMOVIDA: 'Tarefa Removida',
    PROJETO_ATRIBUIDO: 'Novo Projeto Atribuído',
    PROJETO_STATUS_ALTERADO: 'Estado do Projeto Alterado',
    PROJETO_EDITADO: 'Projeto Atualizado',
    PROJETO_ATUALIZADO: 'Projeto Atualizado',
    PROJETO_CONCLUIDO: 'Projeto Concluído',
    PROJETO_REMOVIDO: 'Removido do Projeto',
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
  const handleMarkAsRead = useCallback(async () => {
    if (isNotification(notification)) {
      try {
        await markNotificationAsReadAPI(notification.id);
        onMarkAsRead(notification.id);
        toast.success('Notificação marcada como lida');
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Erro ao marcar notificação como lida');
      }
    }
  }, [notification, onMarkAsRead]);

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

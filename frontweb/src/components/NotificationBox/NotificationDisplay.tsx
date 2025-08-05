import React, { useCallback, useState } from 'react';
import { Notification } from 'types/notification';
import { markNotificationAsReadAPI } from 'api/notificationsApi';
import { toast } from 'react-toastify';

interface NotificationDisplayProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

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
    PROJETO_REMOVIDO: '#FECACA',
  };
  return colors[type] || '#E2E8F0';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMarkAsRead = useCallback(async () => {
    if (!notification.isRead && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await markNotificationAsReadAPI(notification.id);
        onMarkAsRead(notification.id);
        toast.success('Notificação marcada como lida', {
          position: isMobile ? 'bottom-center' : 'top-right',
          autoClose: 2000,
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Erro ao marcar notificação como lida', {
          position: isMobile ? 'bottom-center' : 'top-right',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [notification, onMarkAsRead, isSubmitting, isMobile]);

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
      {!notification.isRead && (
        <button
          onClick={handleMarkAsRead}
          className="mark-read-button"
          disabled={isSubmitting}
          aria-label={`Mark notification as read: ${notification.content}`}
        >
          {isSubmitting ? 'A processar...' : 'Marcar como lida'}
        </button>
      )}
    </div>
  );
};

export default React.memo(NotificationDisplay);

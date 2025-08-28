import React, { useEffect, useState } from 'react';
import { useNotification } from '../../NotificationContext';
import { Notification, NotificationType } from 'types/notification';
import { useAuth } from 'AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import './styles.scss';

interface NotificationBadgeProps {
  userId: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ userId }) => {
  const { notifications, loadStoredNotifications } = useNotification();
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { isAdmin, isManager } = usePermissions();

  // Verificar se o usuário atual pode ver notificações deste usuário específico
  const canViewNotifications =
    user?.id === userId || // Próprio usuário pode ver suas notificações
    isAdmin() || // Admins podem ver tudo
    isManager(); // Managers podem ver tudo

  // Efeito para garantir que as notificações sejam carregadas quando o componente é montado
  useEffect(() => {
    const loadNotifications = async () => {
      // Só carrega as notificações se o usuário tiver permissão
      if (userId > 0 && !isLoaded && canViewNotifications) {
        await loadStoredNotifications(userId, 0, 10);
        setIsLoaded(true);
      }
    };

    loadNotifications();
  }, [userId, loadStoredNotifications, isLoaded, canViewNotifications]);

  // Se não tiver permissão, não mostra nada
  if (!canViewNotifications) return null;

  // Filtra notificações não lidas para este usuário
  const unreadCount = notifications.filter(
    (notification: Notification) =>
      !notification.isRead &&
      notification.user?.id === userId &&
      Object.values(NotificationType).includes(
        notification.type as NotificationType
      )
  ).length;

  // If count is greater than 99, display 99+
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return unreadCount > 0 ? (
    <span
      className="notification-badge"
      aria-label={`${unreadCount} unread notifications`}
    >
      {displayCount}
    </span>
  ) : null;
};

export default NotificationBadge;

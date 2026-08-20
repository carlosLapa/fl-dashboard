import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NotificationBox from '../../components/NotificationBox/NotificationBox';
import { getUserById } from '../../services/userService';
import './notificationStyles.scss';

const NotificationsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getUserById(Number(userId))
      .then((user) => setUserName(user.name))
      .catch(() => setUserName(null));
  }, [userId]);

  return (
    <div className="notifications-page">
      <h1 className="notifications-title">
        {userName ? `Notificações de ${userName}` : 'Notificações'}
      </h1>
      <NotificationBox userId={Number(userId)} />
    </div>
  );
};

export default NotificationsPage;

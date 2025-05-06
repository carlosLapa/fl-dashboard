import React from 'react';
import { useParams } from 'react-router-dom';
import NotificationBox from '../../components/NotificationBox/NotificationBox';
import './styles.scss';

const NotificationsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="notifications-page">
      <h1 className="notifications-title">Notificações</h1>
      <NotificationBox userId={Number(userId)} />
    </div>
  );
};

export default NotificationsPage;

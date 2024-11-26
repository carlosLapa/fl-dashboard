import React from 'react';
import { useParams } from 'react-router-dom';
import NotificationBox from '../../components/NotificationBox/NotificationBox';
import './styles.css';

const NotificationsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <main className="notifications-container flex-grow-1">
      <section className="notifications-page">
        <h1 className="notifications-title">Notificações</h1>
        <NotificationBox userId={Number(userId)} />
      </section>
    </main>
  );
};

export default NotificationsPage;

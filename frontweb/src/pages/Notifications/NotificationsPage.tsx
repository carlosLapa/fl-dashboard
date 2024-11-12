import React from 'react';
import { useParams } from 'react-router-dom';
import NotificationBox from '../../components/NotificationBox/NotificationBox';

const NotificationsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  return (
    <main className="notifications-container flex-grow-1">
      <section className="notifications-page">
        <h1>Notifications for User ID: {userId}</h1>
        <NotificationBox userId={Number(userId)} />
      </section>
    </main>
  );
};

export default NotificationsPage;

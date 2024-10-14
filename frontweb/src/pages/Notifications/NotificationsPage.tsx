import React from 'react';
import NotificationBox from '../../components/NotificationBox/NotificationBox';

const NotificationsPage: React.FC = () => {
  return (
    <main className="notifications-container flex-grow-1">
      <section className="notifications-page">
        <h1>Notifications</h1>
        <NotificationBox />
      </section>
    </main>
  );
};

export default NotificationsPage;

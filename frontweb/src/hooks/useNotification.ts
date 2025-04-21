import { useState } from 'react';
import { NotificationInsertDTO } from '../types/notification';
import { createNotificationAPI } from '../api/requestsApi';

export const useNotification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (
    notification: NotificationInsertDTO
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await createNotificationAPI(notification);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNotification,
    isLoading,
    error,
  };
};

import axios from 'api/apiConfig';
import { Notification, NotificationInsertDTO } from 'types/notification';

export interface PaginatedNotifications {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const getNotificationDetailsAPI = async (
  userId: number,
  page: number = 0,
  size: number = 20
): Promise<PaginatedNotifications> => {
  const response = await axios.get(
    `/notifications/user/${userId}/details?page=${page}&size=${size}`
  );
  return response.data;
};

export const markNotificationAsReadAPI = async (
  notificationId: number
): Promise<void> => {
  await axios.patch(`/notifications/${notificationId}/read`);
};

export const createNotificationAPI = async (
  notification: NotificationInsertDTO
): Promise<Notification> => {
  const response = await axios.post('/notifications', notification);
  return response.data;
};

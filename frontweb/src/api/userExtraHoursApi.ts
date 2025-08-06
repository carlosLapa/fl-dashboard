import axios from 'api/apiConfig';
import {
  UserExtraHoursDTO,
  UserExtraHoursSummaryDTO,
} from '../types/userExtraHours';

export const saveUserExtraHoursAPI = async (data: UserExtraHoursDTO) => {
  const response = await axios.post<UserExtraHoursDTO>(
    '/api/user-extra-hours',
    data
  );
  return response.data;
};

export const getUserExtraHoursByUserAPI = async (userId: number) => {
  const response = await axios.get<UserExtraHoursDTO[]>(
    `/api/user-extra-hours/user/${userId}`
  );
  return response.data;
};

export const deleteUserExtraHoursAPI = async (id: number) => {
  await axios.delete(`/api/user-extra-hours/${id}`);
};

export const getUserExtraHoursMonthlySummaryAPI = async (
  userId: number,
  year: number
) => {
  const response = await axios.get<UserExtraHoursSummaryDTO[]>(
    `/api/user-extra-hours/user/${userId}/monthly-summary/${year}`
  );
  return response.data;
};

export const getUserExtraHoursWeeklySummaryAPI = async (
  userId: number,
  year: number
) => {
  const response = await axios.get<UserExtraHoursSummaryDTO[]>(
    `/api/user-extra-hours/user/${userId}/weekly-summary/${year}`
  );
  return response.data;
};

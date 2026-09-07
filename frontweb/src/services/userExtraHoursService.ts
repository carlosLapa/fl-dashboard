import axios from 'axios';
import {
  getAllUserExtraHoursBalancesAPI,
  getUserExtraHoursBalanceAPI,
  getUserExtraHoursByUserAPI,
  getUserExtraHoursMonthlySummaryAPI,
  getUserExtraHoursWeeklySummaryAPI,
  saveUserExtraHoursAPI,
  deleteUserExtraHoursAPI,
} from 'api/userExtraHoursApi';
import {
  UserExtraHoursBalanceDTO,
  UserExtraHoursDTO,
  UserExtraHoursSummaryDTO,
} from '../types/userExtraHours';

const withPermissionError = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Não tem permissão para aceder a este banco de horas');
    }
    throw error;
  }
};

export const saveUserExtraHours = async (
  data: UserExtraHoursDTO,
): Promise<UserExtraHoursDTO> => withPermissionError(() => saveUserExtraHoursAPI(data));

export const getUserExtraHoursByUser = async (
  userId: number,
): Promise<UserExtraHoursDTO[]> =>
  withPermissionError(() => getUserExtraHoursByUserAPI(userId));

export const deleteUserExtraHours = async (id: number): Promise<void> =>
  withPermissionError(() => deleteUserExtraHoursAPI(id));

export const getUserExtraHoursMonthlySummary = async (
  userId: number,
  year: number,
): Promise<UserExtraHoursSummaryDTO[]> =>
  withPermissionError(() => getUserExtraHoursMonthlySummaryAPI(userId, year));

export const getUserExtraHoursWeeklySummary = async (
  userId: number,
  year: number,
): Promise<UserExtraHoursSummaryDTO[]> =>
  withPermissionError(() => getUserExtraHoursWeeklySummaryAPI(userId, year));

export const getUserExtraHoursBalance = async (
  userId: number,
): Promise<UserExtraHoursBalanceDTO> =>
  withPermissionError(() => getUserExtraHoursBalanceAPI(userId));

export const getAllUserExtraHoursBalances = async (): Promise<
  UserExtraHoursBalanceDTO[]
> => withPermissionError(() => getAllUserExtraHoursBalancesAPI());

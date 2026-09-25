import axios from 'axios';
import {
  getAllUserExtraHoursBalancesAPI,
  getPendingUserExtraHoursAPI,
  approveUserExtraHoursAPI,
  rejectUserExtraHoursAPI,
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

// Like withPermissionError, but also surfaces the backend's own message on a
// 409 (the approval-workflow conflicts raised by UserExtraHoursApprovalException,
// e.g. editing/deleting an entry an admin already approved).
const withApprovalError = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Não tem permissão para aceder a este banco de horas');
      }
      if (error.response?.status === 409 && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
};

export const saveUserExtraHours = async (
  data: UserExtraHoursDTO,
): Promise<UserExtraHoursDTO> => withApprovalError(() => saveUserExtraHoursAPI(data));

export const getUserExtraHoursByUser = async (
  userId: number,
): Promise<UserExtraHoursDTO[]> =>
  withPermissionError(() => getUserExtraHoursByUserAPI(userId));

export const deleteUserExtraHours = async (id: number): Promise<void> =>
  withApprovalError(() => deleteUserExtraHoursAPI(id));

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

export const getPendingUserExtraHours = async (): Promise<
  UserExtraHoursDTO[]
> => withPermissionError(() => getPendingUserExtraHoursAPI());

export const approveUserExtraHours = async (
  id: number,
): Promise<UserExtraHoursDTO> => withPermissionError(() => approveUserExtraHoursAPI(id));

export const rejectUserExtraHours = async (
  id: number,
  reason?: string,
): Promise<UserExtraHoursDTO> =>
  withPermissionError(() => rejectUserExtraHoursAPI(id, reason));

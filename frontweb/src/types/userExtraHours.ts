export enum UserExtraHoursStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface UserExtraHoursDTO {
  id?: number;
  userId: number;
  /** Only populated by endpoints that list entries across users (e.g. /pending). */
  userName?: string;
  date: string; // ISO date string, e.g. "2025-08-06"
  hours: number; // positive for extra, negative for less
  comment?: string;
  status?: UserExtraHoursStatus;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface UserExtraHoursSummaryDTO {
  userId: number;
  period: string; // e.g. "2025-08" for month, "2025-Semana32" for week
  totalHours: number;
}

export interface UserExtraHoursBalanceDTO {
  userId: number;
  userName: string;
  totalHours: number; // lifetime sum of all APPROVED entries: the "Banco de Horas" balance
}

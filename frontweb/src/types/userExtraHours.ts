export interface UserExtraHoursDTO {
  id?: number;
  userId: number;
  date: string; // ISO date string, e.g. "2025-08-06"
  hours: number; // positive for extra, negative for less
  comment?: string;
}

export interface UserExtraHoursSummaryDTO {
  userId: number;
  period: string; // e.g. "2025-08" for month, "2025-Semana32" for week
  totalHours: number;
}

export interface UserExtraHoursBalanceDTO {
  userId: number;
  userName: string;
  totalHours: number; // lifetime sum of all entries: the "Banco de Horas" balance
}
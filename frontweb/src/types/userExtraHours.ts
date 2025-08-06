export interface UserExtraHoursDTO {
  id?: number;
  userId: number;
  date: string; // ISO date string, e.g. "2025-08-06"
  hours: number; // positive for extra, negative for less
  comment?: string;
}

export interface UserExtraHoursSummaryDTO {
  userId: number;
  period: string; // e.g. "2025-08" for month, "2025-W32" for week
  totalHours: number;
}
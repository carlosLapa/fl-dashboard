package com.fl.dashboard.utils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;

/**
 * Working-day counting shared by Tarefa's planned duration (workingDays, diasEstimados), its
 * actual duration (diasReais) and its time in review, so the deviation is measured consistently.
 */
public final class DiasUteis {

    private DiasUteis() {
    }

    /**
     * Weekdays between the two dates, counting both ends; 0 when end is before start,
     * null when either date is missing. Holidays are not excluded.
     */
    public static Integer contar(Date startDate, Date endDate) {
        if (startDate == null || endDate == null) {
            return null;
        }

        Calendar start = meiaNoite(startDate);
        Calendar end = meiaNoite(endDate);

        int workingDays = 0;
        while (!start.after(end)) {
            int dayOfWeek = start.get(Calendar.DAY_OF_WEEK);
            if (dayOfWeek != Calendar.SATURDAY && dayOfWeek != Calendar.SUNDAY) {
                workingDays++;
            }
            start.add(Calendar.DATE, 1);
        }
        return workingDays;
    }

    public static Integer contar(Date startDate, LocalDateTime endDate) {
        if (endDate == null) {
            return null;
        }
        return contar(startDate, Date.from(endDate.atZone(ZoneId.systemDefault()).toInstant()));
    }

    /**
     * Working days elapsed from one moment to another: the weekdays after the start date, up to and
     * including the end date. The same day counts 0, Friday to Monday counts 1. Used for time
     * spent in review, where a same-day review must not count as a whole day.
     */
    public static int decorridos(LocalDateTime de, LocalDateTime ate) {
        if (de == null || ate == null) {
            return 0;
        }
        LocalDate dia = de.toLocalDate().plusDays(1);
        LocalDate fim = ate.toLocalDate();
        int dias = 0;
        while (!dia.isAfter(fim)) {
            DayOfWeek dow = dia.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                dias++;
            }
            dia = dia.plusDays(1);
        }
        return dias;
    }

    private static Calendar meiaNoite(Date date) {
        Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c;
    }
}

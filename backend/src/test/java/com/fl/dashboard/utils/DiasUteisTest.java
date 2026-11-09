package com.fl.dashboard.utils;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class DiasUteisTest {

    private static Date dia(int ano, int mes, int dia) {
        return Date.from(LocalDateTime.of(ano, mes, dia, 15, 30).atZone(ZoneId.systemDefault()).toInstant());
    }

    @Test
    void countsWeekdaysIncludingBothEnds() {
        // Mon 2026-11-02 .. Thu 2026-11-05
        assertEquals(4, DiasUteis.contar(dia(2026, 11, 2), dia(2026, 11, 5)));
        // Fri .. Mon skips the weekend
        assertEquals(2, DiasUteis.contar(dia(2026, 11, 6), dia(2026, 11, 9)));
    }

    @Test
    void endBeforeStartIsZeroAndMissingDateIsNull() {
        assertEquals(0, DiasUteis.contar(dia(2026, 11, 5), dia(2026, 11, 2)));
        assertNull(DiasUteis.contar(null, dia(2026, 11, 2)));
        assertNull(DiasUteis.contar(dia(2026, 11, 2), (LocalDateTime) null));
    }

    @Test
    void acceptsACompletionTimestamp() {
        assertEquals(4, DiasUteis.contar(dia(2026, 11, 2), LocalDateTime.of(2026, 11, 5, 18, 0)));
    }

    @Test
    void elapsedWorkingDaysSkipTheStartDayAndWeekends() {
        LocalDateTime segunda = LocalDateTime.of(2026, 11, 2, 9, 0);
        assertEquals(0, DiasUteis.decorridos(segunda, segunda.withHour(18)));
        assertEquals(3, DiasUteis.decorridos(segunda, LocalDateTime.of(2026, 11, 5, 9, 0)));
        // Friday to Monday
        assertEquals(1, DiasUteis.decorridos(LocalDateTime.of(2026, 11, 6, 17, 0), LocalDateTime.of(2026, 11, 9, 9, 0)));
        assertEquals(0, DiasUteis.decorridos(null, segunda));
    }
}

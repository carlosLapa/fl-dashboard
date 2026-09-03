import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  getUserExtraHoursByUserAPI,
  saveUserExtraHoursAPI,
  deleteUserExtraHoursAPI,
  getUserExtraHoursMonthlySummaryAPI,
  getUserExtraHoursWeeklySummaryAPI,
} from 'api/userExtraHoursApi';
import {
  UserExtraHoursDTO,
  UserExtraHoursSummaryDTO,
} from 'types/userExtraHours';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt';

import './UserExtraHoursCalendar.scss';

moment.locale('pt');
const localizer = momentLocalizer(moment);

interface UserExtraHoursCalendarProps {
  userId: number;
}

const UserExtraHoursCalendar: React.FC<UserExtraHoursCalendarProps> = ({
  userId,
}) => {
  const [entries, setEntries] = useState<UserExtraHoursDTO[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<UserExtraHoursDTO | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [form, setForm] = useState<{ hours: number; comment: string }>({
    hours: 0,
    comment: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const MAX_HOURS = 24;
  const MAX_COMMENT_LENGTH = 255;
  const [monthlySummary, setMonthlySummary] = useState<
    UserExtraHoursSummaryDTO[]
  >([]);
  const [weeklySummary, setWeeklySummary] = useState<
    UserExtraHoursSummaryDTO[]
  >([]);

  // Helper: isWeekend
  const isWeekend = useCallback((date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchSummaries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchEntries = async () => {
    const data = await getUserExtraHoursByUserAPI(userId);
    setEntries(data);
  };

  const fetchSummaries = async () => {
    const year = new Date().getFullYear();
    setMonthlySummary(await getUserExtraHoursMonthlySummaryAPI(userId, year));
    setWeeklySummary(await getUserExtraHoursWeeklySummaryAPI(userId, year));
  };

  // Calendar events: one per entry
  const events = entries.map((entry) => ({
    id: entry.id,
    title: `${entry.hours > 0 ? '+' : ''}${entry.hours}h${
      entry.comment ? ' - ' + entry.comment : ''
    }`,
    start: new Date(entry.date),
    end: new Date(entry.date),
    allDay: true,
    resource: entry,
  }));

  // Handle day click (empty slot)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    const entry = entries.find(
      (e) => e.date === moment(start).format('YYYY-MM-DD')
    );
    setSelectedEntry(entry || null);
    setForm({
      hours: entry ? entry.hours : 0,
      comment: entry ? entry.comment || '' : '',
    });
    setFormError(null);
  };

  // Handle event click (existing entry)
  const handleEventClick = (event: any) => {
    setSelectedDate(event.start);
    setSelectedEntry(event.resource);
    setForm({
      hours: event.resource.hours,
      comment: event.resource.comment || '',
    });
    setFormError(null);
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    if (!form.hours || Math.abs(form.hours) > MAX_HOURS) {
      setFormError(`As horas devem estar entre -${MAX_HOURS} e ${MAX_HOURS}`);
      return;
    }
    setFormError(null);

    const dto: UserExtraHoursDTO = {
      id: selectedEntry?.id,
      userId,
      date: moment(selectedDate).format('YYYY-MM-DD'),
      hours: form.hours,
      comment: form.comment,
    };
    try {
      await saveUserExtraHoursAPI(dto);
      await fetchEntries();
      await fetchSummaries();
      setSelectedDate(null);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Erro ao gravar horas extra:', error);
      setFormError('Não foi possível gravar. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (selectedEntry?.id) {
      try {
        await deleteUserExtraHoursAPI(selectedEntry.id);
        await fetchEntries();
        await fetchSummaries();
      } catch (error) {
        console.error('Erro ao excluir horas extra:', error);
        setFormError('Não foi possível excluir. Tente novamente.');
        return;
      }
    }
    setSelectedDate(null);
    setSelectedEntry(null);
  };

  // Custom date cell styling to highlight weekends
  const dayPropGetter = useCallback(
    (date: Date) => {
      if (isWeekend(date)) {
        return {
          style: {
            backgroundColor: '#fff1f0',
            borderLeft: '1px solid #ffccc7',
            borderRight: '1px solid #ffccc7',
          },
          className: 'weekend-day',
        };
      }
      return {};
    },
    [isWeekend]
  );

  return (
    <div className="calendar-container">
      <h3>Calendário de Horas Extra/Faltas</h3>
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          dayPropGetter={dayPropGetter}
          views={['month']}
          messages={{
            allDay: 'Dia inteiro',
            previous: 'Anterior',
            next: 'Próximo',
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',
            date: 'Data',
            time: 'Hora',
            event: 'Evento',
          }}
        />
      </div>
      {selectedDate && (
        <div className="extra-hours-form">
          <h4>{moment(selectedDate).format('DD/MM/YYYY')}</h4>
          {formError && <p className="extra-hours-error">{formError}</p>}
          <input
            type="number"
            value={form.hours}
            min={-MAX_HOURS}
            max={MAX_HOURS}
            step={0.5}
            onChange={(e) =>
              setForm({ ...form, hours: Number(e.target.value) })
            }
            placeholder="Horas (+/-)"
          />
          <input
            type="text"
            value={form.comment}
            maxLength={MAX_COMMENT_LENGTH}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Comentário"
          />
          <button onClick={handleSave}>Gravar</button>
          {selectedEntry && <button onClick={handleDelete}>Excluir</button>}
          <button
            onClick={() => {
              setSelectedDate(null);
              setSelectedEntry(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
      <div>
        <h4>Resumo Mensal</h4>
        <ul>
          {monthlySummary.map((s) => (
            <li key={s.period}>
              {s.period}: {s.totalHours} hora(s)
            </li>
          ))}
        </ul>
        <h4>Resumo Semanal</h4>
        <ul>
          {weeklySummary.map((s) => (
            <li key={s.period}>
              {s.period}: {s.totalHours} hora(s)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserExtraHoursCalendar;

import React, { useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { UserExtraHoursDTO, UserExtraHoursStatus } from 'types/userExtraHours';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt';

import './UserExtraHoursCalendar.scss';

moment.locale('pt');
const localizer = momentLocalizer(moment);

interface UserExtraHoursCalendarProps {
  entries: UserExtraHoursDTO[];
  /** A day or an existing entry was clicked; `entry` is null for an empty day. */
  onSelectDate: (date: string, entry: UserExtraHoursDTO | null) => void;
}

const UserExtraHoursCalendar: React.FC<UserExtraHoursCalendarProps> = ({
  entries,
  onSelectDate,
}) => {
  // Helper: isWeekend
  const isWeekend = useCallback((date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }, []);

  // Calendar events: one per entry
  const events = entries.map((entry) => {
    const statusSuffix =
      entry.status === UserExtraHoursStatus.PENDING
        ? ' (pendente)'
        : entry.status === UserExtraHoursStatus.REJECTED
          ? ' (rejeitado)'
          : '';
    return {
      id: entry.id,
      title: `${entry.hours > 0 ? '+' : ''}${entry.hours}h${
        entry.comment ? ' - ' + entry.comment : ''
      }${statusSuffix}`,
      start: new Date(entry.date),
      end: new Date(entry.date),
      allDay: true,
      resource: entry,
    };
  });

  // Color events by approval status: pending (amber) and rejected (grey)
  // stand out from approved entries, which keep the extra/falta green-red cue.
  const eventPropGetter = useCallback((event: { resource: UserExtraHoursDTO }) => {
    const entry = event.resource;
    let backgroundColor = entry.hours >= 0 ? '#15803d' : '#b91c1c';
    if (entry.status === UserExtraHoursStatus.PENDING) {
      backgroundColor = '#d97706';
    } else if (entry.status === UserExtraHoursStatus.REJECTED) {
      backgroundColor = '#9ca3af';
    }
    return { style: { backgroundColor } };
  }, []);

  // Handle day click (empty slot)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    const date = moment(start).format('YYYY-MM-DD');
    onSelectDate(date, entries.find((e) => e.date === date) || null);
  };

  // Handle event click (existing entry)
  const handleEventClick = (event: any) => {
    onSelectDate(event.resource.date, event.resource);
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
          eventPropGetter={eventPropGetter}
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
    </div>
  );
};

export default UserExtraHoursCalendar;

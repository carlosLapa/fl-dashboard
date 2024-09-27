import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { TarefaWithUsersAndProjetoDTO } from '../../types/tarefa';

import './styles.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface TarefasCalendarProps {
  tarefas: TarefaWithUsersAndProjetoDTO[];
}

const TarefasCalendar: React.FC<TarefasCalendarProps> = ({ tarefas }) => {
  // Transform tarefas into events for the calendar
  const events = tarefas.map((tarefa) => ({
    id: tarefa.id,
    title: tarefa.descricao,
    start: new Date(tarefa.prazoReal),
    end: new Date(tarefa.prazoReal),
    allDay: true,
  }));

  return (
    <div style={{ height: '500px', width: '101%', marginLeft: '7%' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default TarefasCalendar;

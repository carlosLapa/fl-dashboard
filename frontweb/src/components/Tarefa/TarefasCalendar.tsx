import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styles.css';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const localizer = momentLocalizer(moment);

interface TarefasCalendarProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  title?: string;
}

const TarefasCalendar: React.FC<TarefasCalendarProps> = ({ tarefas, title = 'Calendar' }) => {
  const events = tarefas.map((tarefa) => ({
    id: tarefa.id,
    title: tarefa.descricao,
    start: new Date(tarefa.prazoReal),
    end: new Date(tarefa.prazoReal),
    allDay: true,
  }));

  const messages = {
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
  };

  return (
    <div style={{ height: '500px', width: '101%', marginLeft: '7%' }}>
      <h3>{title}</h3>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        messages={messages}
      />
    </div>
  );
};

export default TarefasCalendar;

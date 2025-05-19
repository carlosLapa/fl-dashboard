import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt-br';
import './styles.scss';
import TarefaDetailsCard from './TarefaDetailsCard';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface TarefasCalendarProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  title?: string;
}

const TarefasCalendar: React.FC<TarefasCalendarProps> = ({
  tarefas,
  title = 'Calendário de Tarefas',
}) => {
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);

  // Filter out tarefas without valid dates to prevent errors
  const validTarefas = tarefas.filter(
    (tarefa) => tarefa.prazoReal && !isNaN(new Date(tarefa.prazoReal).getTime())
  );

  const events = validTarefas.map((tarefa) => ({
    id: tarefa.id,
    title: tarefa.descricao,
    start: new Date(tarefa.prazoReal),
    end: new Date(tarefa.prazoReal),
    allDay: true,
    resource: tarefa, // Store the full tarefa object for potential tooltips or details
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

  // Custom event styling based on tarefa status
  const eventStyleGetter = (event: any) => {
    const tarefa = event.resource;
    let backgroundColor = '#3174ad'; // default color

    if (tarefa) {
      switch (tarefa.status) {
        case 'DONE':
          backgroundColor = '#28a745'; // green for completed
          break;
        case 'IN_PROGRESS':
          backgroundColor = '#ffc107'; // yellow for in progress
          break;
        case 'IN_REVIEW':
          backgroundColor = '#17a2b8'; // teal for review
          break;
        case 'TODO':
          backgroundColor = '#dc3545'; // red for todo
          break;
        default:
          backgroundColor = '#6c757d'; // gray for backlog or others
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
        cursor: 'pointer', // Add cursor pointer to indicate clickable
      },
    };
  };

  // Handle event click
  const handleEventClick = (event: any) => {
    setSelectedTarefa(event.resource);
  };

  // Close the details card
  const handleCloseDetails = () => {
    setSelectedTarefa(null);
  };

  return (
    <div className="calendar-container">
      <h3 className="calendar-title">{title}</h3>
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          messages={messages}
          views={['month', 'week', 'day', 'agenda']}
          popup
          tooltipAccessor={(event) => event.title}
          onSelectEvent={handleEventClick}
        />
      </div>

      {selectedTarefa && (
        <TarefaDetailsCard
          tarefa={selectedTarefa}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default TarefasCalendar;

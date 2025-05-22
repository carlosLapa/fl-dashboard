import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt-br';
import './styles.scss';
import TarefaDetailsCard from './TarefaDetailsCard';

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Define an extended type that includes workingDays
interface TarefaWithWorkingDays extends TarefaWithUserAndProjetoDTO {
  workingDays?: number;
}

interface TarefasCalendarProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  title?: string;
  onWorkingDaysCalculated?: (tarefaId: number, workingDays: number) => void;
}

const TarefasCalendar: React.FC<TarefasCalendarProps> = ({
  tarefas,
  title = 'Calendário de Tarefas',
  onWorkingDaysCalculated,
}) => {
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);
  const [tarefasWithWorkingDays, setTarefasWithWorkingDays] = useState<
    TarefaWithWorkingDays[]
  >([]);

  // Use ref to prevent infinite loop
  const calculationsPerformedRef = useRef(false);
  const previousTarefasLengthRef = useRef(tarefas.length);

  // Helper function to check if a date is a weekend (Saturday or Sunday)
  const isWeekend = useCallback((date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  }, []);

  // Helper function to get the next weekday (skip weekends)
  const getNextWeekday = useCallback(
    (date: Date): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + 1);
      while (isWeekend(result)) {
        result.setDate(result.getDate() + 1);
      }
      return result;
    },
    [isWeekend]
  );

  // Helper function to calculate working days between two dates
  const calculateWorkingDays = useCallback(
    (startDate: Date, endDate: Date): number => {
      let workingDays = 0;
      let currentDate = new Date(startDate);

      // Set both dates to midnight to ensure we're only comparing dates, not times
      currentDate.setHours(0, 0, 0, 0);
      const endDateMidnight = new Date(endDate);
      endDateMidnight.setHours(0, 0, 0, 0);

      // Count working days
      while (currentDate <= endDateMidnight) {
        if (!isWeekend(currentDate)) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return workingDays;
    },
    [isWeekend]
  );

  // Reset calculations when tarefas array length changes
  useEffect(() => {
    if (previousTarefasLengthRef.current !== tarefas.length) {
      calculationsPerformedRef.current = false;
      previousTarefasLengthRef.current = tarefas.length;
    }
  }, [tarefas.length]);

  // Calculate working days for each tarefa
  useEffect(() => {
    // Only perform calculations once
    if (calculationsPerformedRef.current) return;

    // Filter out tarefas without valid dates to prevent errors
    const validTarefas = tarefas.filter(
      (tarefa) =>
        // Ensure prazoReal exists and is valid
        tarefa.prazoReal &&
        !isNaN(new Date(tarefa.prazoReal).getTime()) &&
        // If prazoEstimado exists, ensure it's valid
        (!tarefa.prazoEstimado ||
          !isNaN(new Date(tarefa.prazoEstimado).getTime()))
    );

    const tarefasWithDays = validTarefas.map((tarefa) => {
      // Use prazoEstimado as start date if available, otherwise use prazoReal for both
      const startDate = tarefa.prazoEstimado
        ? new Date(tarefa.prazoEstimado)
        : new Date(tarefa.prazoReal);

      const endDate = new Date(tarefa.prazoReal);

      // Calculate working days
      const workingDays = calculateWorkingDays(startDate, endDate);

      // Call the callback if provided
      if (onWorkingDaysCalculated) {
        onWorkingDaysCalculated(tarefa.id, workingDays);
      }

      return {
        ...tarefa,
        workingDays,
      };
    });

    setTarefasWithWorkingDays(tarefasWithDays);
    calculationsPerformedRef.current = true;
  }, [tarefas, onWorkingDaysCalculated, calculateWorkingDays]);

  // Helper function to create event segments that exclude weekends
  const createWeekdayEventSegments = useCallback(
    (tarefa: TarefaWithWorkingDays, startDate: Date, endDate: Date) => {
      const segments = [];
      let segmentStart = new Date(startDate);
      let segmentEnd;

      // If start date is a weekend, move to next weekday
      if (isWeekend(segmentStart)) {
        segmentStart = getNextWeekday(segmentStart);
      }

      // If start date is after end date, return empty array
      if (segmentStart > endDate) {
        return [];
      }

      // Create segments for each work week
      while (segmentStart <= endDate) {
        // Find the end of the current work week (Friday) or the task end date, whichever comes first
        segmentEnd = new Date(segmentStart);

        // If we're not already at Friday, find the next Friday or the end date
        if (segmentStart.getDay() !== 5) {
          // 5 is Friday
          // Calculate days until Friday
          const daysUntilFriday =
            segmentStart.getDay() <= 5
              ? 5 - segmentStart.getDay()
              : 5 + (7 - segmentStart.getDay());

          segmentEnd.setDate(segmentStart.getDate() + daysUntilFriday);

          // If Friday is after the end date, use the end date
          if (segmentEnd > endDate) {
            segmentEnd = new Date(endDate);
          }
        }

        // Set end time to end of day
        segmentEnd.setHours(23, 59, 59, 999);

        // Add the segment
        segments.push({
          id: `${tarefa.id}-${segments.length}`,
          title: tarefa.descricao,
          start: new Date(segmentStart),
          end: new Date(segmentEnd),
          allDay: true,
          resource: tarefa,
          // Store original dates for tooltip
          originalStart: tarefa.prazoEstimado
            ? new Date(tarefa.prazoEstimado)
            : new Date(tarefa.prazoReal),
          originalEnd: new Date(tarefa.prazoReal),
          // Store working days
          workingDays: tarefa.workingDays,
        });

        // Move to the next Monday
        segmentStart = new Date(segmentEnd);
        segmentStart.setDate(segmentStart.getDate() + 3); // Skip to Monday (add 3 days from Friday)

        // If we've gone past the end date, we're done
        if (segmentStart > endDate) {
          break;
        }
      }

      return segments;
    },
    [isWeekend, getNextWeekday]
  );

  // Create events, splitting them to exclude weekends
  const events = tarefasWithWorkingDays.flatMap((tarefa) => {
    // Use prazoEstimado as start date if available, otherwise use prazoReal for both
    const startDate = tarefa.prazoEstimado
      ? new Date(tarefa.prazoEstimado)
      : new Date(tarefa.prazoReal);

    const endDate = new Date(tarefa.prazoReal);

    // Create segments that exclude weekends
    return createWeekdayEventSegments(tarefa, startDate, endDate);
  });

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
  const eventStyleGetter = useCallback((event: any) => {
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
        case 'BACKLOG':
          backgroundColor = '#6c757d'; // gray for backlog
          break;
        default:
          backgroundColor = '#6c757d'; // gray for others
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
  }, []);

  // Custom date cell styling to highlight weekends
  const dayPropGetter = useCallback(
    (date: Date) => {
      if (isWeekend(date)) {
        return {
          style: {
            backgroundColor: '#fff1f0', // Light reddish background for weekends
            borderLeft: '1px solid #ffccc7',
            borderRight: '1px solid #ffccc7',
          },
          className: 'weekend-day', // Add a class for additional styling if needed
        };
      }
      return {};
    },
    [isWeekend]
  );

  // Handle event click
  const handleEventClick = useCallback((event: any) => {
    setSelectedTarefa(event.resource);
  }, []);

  // Close the details card
  const handleCloseDetails = useCallback(() => {
    setSelectedTarefa(null);
  }, []);

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
          dayPropGetter={dayPropGetter}
          messages={messages}
          views={['month', 'week', 'day', 'agenda']}
          popup
          tooltipAccessor={(event) => {
            // Use original dates for tooltip
            const startFormatted = moment(event.originalStart).format(
              'DD/MM/YYYY'
            );
            const endFormatted = moment(event.originalEnd).format('DD/MM/YYYY');
            const workingDays = event.workingDays || 0;

            if (startFormatted === endFormatted) {
              return `${event.title} (${startFormatted}) - ${workingDays} dia(s) útil(eis)`;
            }

            return `${event.title} (${startFormatted} - ${endFormatted}) - ${workingDays} dia(s) útil(eis)`;
          }}
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

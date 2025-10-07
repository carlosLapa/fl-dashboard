import { ProjetoFilterState, TarefaFilterState } from '../../../types/filters';

// Function to check if any projeto filters are active
export const hasActiveFilters = (filters: ProjetoFilterState): boolean => {
  return (
    !!filters.designacao ||
    !!filters.cliente ||
    !!filters.clienteId ||
    !!filters.prioridade ||
    (filters.status && filters.status !== 'ALL') ||
    !!filters.startDate ||
    !!filters.endDate
  );
};

// Function to check if any tarefa filters are active
export const hasTarefaActiveFilters = (filters: TarefaFilterState): boolean => {
  return (
    !!filters.descricao ||
    !!filters.projetoId ||
    !!filters.status ||
    !!filters.startDate ||
    !!filters.endDate
  );
};

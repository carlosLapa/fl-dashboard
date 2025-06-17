import { useState, useCallback } from 'react';
import { TarefaFilterState } from '../types/filters';

const initialFilters: TarefaFilterState = {
  descricao: '',
  status: '',
  projetoId: '',
  startDate: '',
  endDate: '',
  dateFilterField: 'prazoEstimado', // Default to filter by deadline
};

export const useTarefaFilters = () => {
  const [filters, setFilters] = useState<TarefaFilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const updateFilter = useCallback(
    (name: keyof TarefaFilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    // Check if any filter is active
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
      return value && value !== '' && key !== 'dateFilterField';
    });

    setIsFiltered(hasActiveFilters);
    // You would typically trigger a data fetch here
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setIsFiltered(false);
    // You would typically trigger a data fetch here
  }, []);

  return {
    filters,
    updateFilter,
    showFilters,
    setShowFilters,
    isFiltered,
    applyFilters,
    clearFilters,
  };
};

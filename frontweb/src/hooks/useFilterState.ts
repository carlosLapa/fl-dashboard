import { useState, useCallback, useEffect } from 'react';
import { BaseFilterState, ProjetoFilterState } from '../types/filters';
import secureStorage from '../auth/secureStorage';

const defaultProjetoFilterState: ProjetoFilterState = {
  designacao: '',
  cliente: '',
  clienteId: undefined,
  prioridade: '',
  status: 'ALL',
  startDate: '',
  endDate: '',
  tipo: undefined,
};

export function useFilterState<T extends BaseFilterState>(
  initialState: T,
  storageKey?: string // Optional storage key for persisting filters
) {
  // Current filter state (what's displayed in the UI)
  const [filters, setFilters] = useState<T>(() => {
    // If a storage key is provided, try to load saved filters
    if (storageKey) {
      try {
        const savedFilters = secureStorage.getItem(storageKey);
        if (savedFilters) {
          return JSON.parse(savedFilters) as T;
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
    return initialState;
  });

  // Applied filter state (what's used for filtering)
  const [appliedFilters, setAppliedFilters] = useState<T>(filters);

  // Flag to indicate if filters are applied
  const [isFiltered, setIsFiltered] = useState(false);

  // Save filters to secureStorage when they change
  useEffect(() => {
    if (storageKey) {
      try {
        secureStorage.setItem(storageKey, JSON.stringify(filters));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    }
  }, [filters, storageKey]);

  // Update a single filter value
  const updateFilter = useCallback((name: keyof T, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Apply all current filters
  const applyFilters = useCallback(() => {
    // Verificação mais robusta para detecção de filtros ativos
    const hasFilters = Object.entries(filters).some(([key, value]) => {
      // Log para debug
      console.log(`Verificando filtro ${key}: ${value} (${typeof value})`);
      
      // Ignorar status ALL
      if (key === 'status' && value === 'ALL') return false;
      
      // Ignorar tipo vazio ou ALL
      if (key === 'tipo' && (value === 'ALL' || value === '' || value === undefined)) return false;
      
      // Tratamento especial para clienteId
      if (key === 'clienteId') {
        return value !== undefined && value !== null;
      }
      
      // Tratamento para strings
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      
      // Outros tipos
      return value !== undefined && value !== null && value !== '';
    });

    // Log da decisão
    console.log(`Filtros ativos detectados: ${hasFilters}`, filters);

    if (!hasFilters) {
      return false; // Return false to indicate no filters were applied
    }

    setAppliedFilters({...filters}); // Usar um objeto novo para garantir reatividade
    setIsFiltered(true);
    return true; // Return true to indicate filters were applied
  }, [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialState);
    setAppliedFilters(initialState);
    setIsFiltered(false);
  }, [initialState]);

  return {
    // Current filter state
    filters,
    // Applied filter state (for API calls)
    appliedFilters,
    // Flag to indicate if filters are applied
    isFiltered,
    // Functions
    updateFilter,
    applyFilters,
    clearFilters,
    // Direct state setters (for advanced use cases)
    setFilters,
    setAppliedFilters,
    setIsFiltered,
  };
}

// Convenience hook for projeto filters
export function useProjetoFilters() {
  return useFilterState<ProjetoFilterState>(
    defaultProjetoFilterState,
    'projeto-filters' // Storage key for projeto filters
  );
}

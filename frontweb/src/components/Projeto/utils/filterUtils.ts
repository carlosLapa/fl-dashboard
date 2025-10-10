import { BaseFilterState } from '../../../types/filters';

/**
 * Checks if any filter in the filter state has a value
 * @param filters The filter state to check
 * @returns True if any filter has a value, false otherwise
 */
export const hasActiveFilters = (filters: BaseFilterState): boolean => {
  if (!filters) return false;
  
  // Debug para identificar os valores dos filtros
  Object.entries(filters).forEach(([key, value]) => {
    console.log(`Checking filter ${key}: ${value} (type: ${typeof value})`, 
      key === 'clienteId' && value !== undefined ? 'ACTIVE' : '');
  });
  
  return Object.entries(filters).some(([key, value]) => {
    // Ignorar status se for 'ALL'
    if (key === 'status' && value === 'ALL') return false;
    
    // Ignorar tipo se for 'ALL' ou vazio
    if (key === 'tipo' && (value === 'ALL' || value === '')) return false;
    
    // Caso especial para clienteId - é ativo se for um número válido
    if (key === 'clienteId') {
      const isActive = value !== undefined && value !== null;
      if (isActive) console.log(`Filtro ativo: clienteId=${value}`);
      return isActive;
    }
    
    // Caso especial para cliente (nome) - é ativo apenas se não for vazio
    if (key === 'cliente') {
      const isActive = value !== undefined && value !== null && value !== '';
      if (isActive) console.log(`Filtro ativo: cliente="${value}"`);
      return isActive;
    }
    
    // Para strings, só é ativo se não for vazio
    if (typeof value === 'string') {
      const isActive = value.trim() !== '';
      if (isActive) console.log(`Filtro ativo: ${key}="${value}"`);
      return isActive;
    }
    
    // Para outros tipos, é ativo se não for undefined ou null
    const isActive = value !== undefined && value !== null;
    if (isActive) console.log(`Filtro ativo: ${key}=${value}`);
    return isActive;
  });
};

/**
 * Converts a filter state to URL search params
 * @param filters The filter state to convert
 * @returns URLSearchParams object
 */
export const filtersToSearchParams = (
  filters: BaseFilterState
): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'ALL') {
      params.append(key, value);
    }
  });

  return params;
};

/**
 * Converts URL search params to a filter state
 * @param params The URL search params to convert
 * @param defaultState The default filter state
 * @returns A filter state object
 */
export const searchParamsToFilters = <T extends BaseFilterState>(
  params: URLSearchParams,
  defaultState: T
): T => {
  const filters = { ...defaultState };

  // For each key in the default state, check if there's a param with that key
  Object.keys(defaultState).forEach((key) => {
    const value = params.get(key);
    if (value) {
      filters[key as keyof T] = value as any;
    }
  });

  return filters;
};

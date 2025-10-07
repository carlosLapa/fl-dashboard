import { BaseFilterState } from '../../../types/filters';

/**
 * Checks if any filter in the filter state has a value
 * @param filters The filter state to check
 * @returns True if any filter has a value, false otherwise
 */
export const hasActiveFilters = (filters: BaseFilterState): boolean => {
  return Object.entries(filters).some(([key, value]) => {
    // Skip status if it's 'ALL'
    if (key === 'status' && value === 'ALL') return false;
    // Skip clienteId if it's undefined
    if (key === 'clienteId' && value === undefined) return false;
    // Consider a filter applied if it has a non-empty value
    return value !== '' && value !== undefined && value !== null;
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

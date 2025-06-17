import { useState, useCallback } from 'react';

interface TableState {
  page: number;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
}

export function useTableState(initialState: TableState) {
  const [page, setPage] = useState(initialState.page);
  const [sortField, setSortField] = useState(initialState.sortField);
  const [sortDirection, setSortDirection] = useState(
    initialState.sortDirection
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSort = useCallback((field: string) => {
    setSortField((prevField) => {
      if (prevField === field) {
        // If clicking the same field, toggle direction
        setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        return field;
      } else {
        // If clicking a new field, default to ASC
        setSortDirection('ASC');
        return field;
      }
    });
  }, []);

  return {
    page,
    sortField,
    sortDirection,
    handlePageChange,
    handleSort,
    setPage,
    setSortField,
    setSortDirection,
  };
}

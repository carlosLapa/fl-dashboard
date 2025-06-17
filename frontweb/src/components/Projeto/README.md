# Projeto Components

This directory contains components related to the Project (Projeto) management functionality.

## Component Structure

- `ProjetoTable.tsx` - Main table component for displaying projects
- `ProjetoFilterPanel.tsx` - Filter panel for the project table
- `ProjetoStatusBadge.tsx` - Badge component for displaying project status

### ProjetoTableComponents/

This subdirectory contains components that are part of the ProjetoTable:

- `ProjetoTableHeader.tsx` - Table header with sorting functionality
- `ProjetoTableRow.tsx` - Individual row component for each project
- `ProjetoPagination.tsx` - Pagination controls for the table
- `ProjetoEmptyState.tsx` - Component shown when no projects match the filters
- `ProjetoLoadingState.tsx` - Loading indicator for the table

## Usage

```tsx
import ProjetoTable from './components/Projeto/ProjetoTable';

// In your component
<ProjetoTable
  projetos={projetos}
  onEditProjeto={handleEditProjeto}
  onDeleteProjeto={handleDeleteProjeto}
  page={page}
  onPageChange={handlePageChange}
  totalPages={totalPages}
  filters={filters}
  updateFilter={updateFilter}
  onApplyFilters={handleApplyFilters}
  onClearFilters={handleClearFilters}
  isLoading={isLoading}
  sortField={sortField}
  sortDirection={sortDirection}
  onSort={handleSort}
/>;
```

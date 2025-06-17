import React, { useRef, useCallback, useEffect, ReactNode } from 'react';
import { Button, Row, Card, Collapse, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
  faKeyboard,
} from '@fortawesome/free-solid-svg-icons';

// Generic props that all filter panels will need
export interface BaseFilterPanelProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  title?: string;
  activeFiltersCount?: number;
  children: ReactNode;
}

const BaseFilterPanel: React.FC<BaseFilterPanelProps> = ({
  showFilters,
  setShowFilters,
  onApplyFilters,
  onClearFilters,
  title = 'Filtros Avançados',
  activeFiltersCount = 0,
  children,
}) => {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLButtonElement>(null);
  const filterCardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Set focus to first input when filters are shown
  useEffect(() => {
    if (showFilters && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100); // Small delay to ensure the collapse animation has started
    }
  }, [showFilters]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }

      // Escape key to clear filters - works globally when filter card is visible
      if (e.key === 'Escape' && showFilters) {
        e.preventDefault();
        onClearFilters();
      }

      // Enter key to apply filters when filter card is visible
      // Only if not in an input field that's handling its own Enter key
      if (
        e.key === 'Enter' &&
        showFilters &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        // Check if we're in a form field
        const activeElement = document.activeElement;
        const isInFormField =
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'SELECT';

        // If we're in a SELECT element, we want to apply filters
        if (activeElement?.tagName === 'SELECT') {
          e.preventDefault();
          onApplyFilters();
        }
        // If we're not in any form field, also apply filters
        else if (!isInFormField) {
          e.preventDefault();
          onApplyFilters();
        }
        // Otherwise, let the default behavior happen
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showFilters, onClearFilters, onApplyFilters, setShowFilters]);

  // Tab key navigation for focus trap
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstInputRef.current) {
        e.preventDefault();
        lastInputRef.current?.focus();
      } else if (
        !e.shiftKey &&
        document.activeElement === lastInputRef.current
      ) {
        e.preventDefault();
        firstInputRef.current?.focus();
      }
    }
  }, []);

  // Keyboard shortcuts for filter actions
  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Apply filters on Enter key
      if (e.key === 'Enter') {
        // For SELECT elements, we need to prevent the default behavior
        // which would be to close the dropdown without submitting
        if (e.currentTarget.tagName === 'SELECT') {
          e.preventDefault();
          onApplyFilters();
        }
      }
      // Clear filters on Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onClearFilters();
      }
    },
    [onApplyFilters, onClearFilters]
  );

  return (
    <Card className="mb-4" ref={filterCardRef}>
      <Card.Header
        className="d-flex justify-content-between align-items-center"
        onClick={() => setShowFilters(!showFilters)}
        style={{ cursor: 'pointer' }}
        aria-expanded={showFilters}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowFilters(!showFilters);
          }
        }}
      >
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faFilter} className="me-2" />
          {title}
          {/* Show active filters count badge if there are active filters */}
          {activeFiltersCount > 0 && (
            <Badge bg="primary" className="ms-2" pill>
              {activeFiltersCount}
            </Badge>
          )}
          <Badge bg="light" text="dark" className="ms-2">
            <FontAwesomeIcon icon={faKeyboard} className="me-1" size="xs" />
            Alt+F
          </Badge>
        </h5>
        <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
      </Card.Header>
      <Collapse in={showFilters}>
        <div>
          <Card.Body>
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                onApplyFilters();
              }}
              onKeyDown={(e) => {
                // Special handling for Enter key in SELECT elements
                if (
                  e.key === 'Enter' &&
                  e.target instanceof HTMLSelectElement
                ) {
                  e.preventDefault();
                  onApplyFilters();
                }
              }}
            >
              <Row className="g-3">
                {/* Pass children as is */}
                {children}
              </Row>
              <div className="d-flex justify-content-between mt-3">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={onClearFilters}
                  className="clear-filters-btn"
                  onKeyDown={handleFilterKeyDown}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Limpar Filtros
                  <small className="ms-1 text-muted">(Esc)</small>
                </Button>
                <Button
                  type="submit"
                  ref={lastInputRef}
                  variant="primary"
                  className="apply-filters-btn"
                  onKeyDown={(e) => {
                    handleTabKey(e);
                  }}
                >
                  Aplicar Filtros
                  <small className="ms-1 text-muted">(Enter)</small>
                </Button>
              </div>
            </form>
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default BaseFilterPanel;

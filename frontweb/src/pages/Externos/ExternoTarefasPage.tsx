import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getExternoWithTarefasById } from 'services/externoService';
import { ExternoWithTarefasDTO } from 'types/externo';
import TarefaTable from 'components/Tarefa/TarefaTable';
import ExternoDetailsCard from 'components/Externo/ExternoDetailsCard';
import './externosStyles.scss'; // Using your existing styles
import { TarefaWithUserAndProjetoDTO } from 'types/tarefa';
import { useTarefaFilters } from 'hooks/useTarefaFilters';

const ExternoTarefasPage: React.FC = () => {
  const { externoId } = useParams<{ externoId: string }>();
  const navigate = useNavigate();
  const [externo, setExterno] = useState<ExternoWithTarefasDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Use our new hook for filter management
  const { filters, updateFilter, applyFilters, clearFilters } =
    useTarefaFilters();

  useEffect(() => {
    const fetchExternoWithTarefas = async () => {
      if (externoId) {
        setIsLoading(true);
        try {
          const externoData = await getExternoWithTarefasById(
            Number(externoId)
          );
          setExterno(externoData);
          setError(null);
        } catch (err) {
          console.error('Error loading externo with tarefas:', err);
          setError(
            'Falha ao carregar as tarefas do colaborador externo. Por favor, tente novamente.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExternoWithTarefas();
  }, [externoId]);

  const handleGoBack = () => {
    navigate('/externos');
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Empty handlers for TarefaTable props
  const handleEditTarefa = (tarefaId: number) => {
    console.log(`Edit tarefa ${tarefaId} - Not implemented in this view`);
  };

  const handleDeleteTarefa = (tarefaId: number) => {
    console.log(`Delete tarefa ${tarefaId} - Not implemented in this view`);
  };

  const handleViewDetails = (tarefaId: number) => {
    console.log(
      `View tarefa details ${tarefaId} - Not implemented in this view`
    );
  };

  // Handler for applying filters
  const handleApplyFilters = () => {
    console.log('Apply filters - Not implemented in this view', filters);
    applyFilters();
    // In a real implementation, you would fetch filtered data here
  };

  // Handler for clearing filters
  const handleClearFilters = () => {
    console.log('Clear filters - Not implemented in this view');
    clearFilters();
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            width: '98%',
            marginLeft: '2%',
            marginRight: '2%',
            marginTop: '2rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            width: '98%',
            marginLeft: '2%',
            marginRight: '2%',
            marginTop: '2rem',
          }}
        >
          <Alert variant="danger">{error}</Alert>
          <Button variant="secondary" onClick={handleGoBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar para Colaboradores Externos
          </Button>
        </div>
      </div>
    );
  }

  if (!externo) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            width: '98%',
            marginLeft: '2%',
            marginRight: '2%',
            marginTop: '2rem',
          }}
        >
          <Alert variant="warning">Colaborador externo não encontrado.</Alert>
          <Button variant="secondary" onClick={handleGoBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Voltar para Colaboradores Externos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      {/* Wrap the title container and table in a div with consistent width and margins */}
      <div
        style={{
          width: '98%',
          marginLeft: '2%',
          marginRight: '2%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <h2 className="page-title">Tarefas de {externo.name}</h2>
          <div className="page-actions">
            <Button variant="secondary" onClick={handleGoBack} className="me-2">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Voltar
            </Button>
            <Button variant="info" onClick={handleShowDetails}>
              Ver Detalhes
            </Button>
          </div>
        </div>
        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          {externo.tarefas && externo.tarefas.length > 0 ? (
            <TarefaTable
              tarefas={externo.tarefas as TarefaWithUserAndProjetoDTO[]}
              onEditTarefa={handleEditTarefa}
              onDeleteTarefa={handleDeleteTarefa}
              onViewDetails={handleViewDetails}
              page={0}
              totalPages={1}
              onPageChange={() => {}}
              isLoading={false}
              // New filter props
              filters={filters}
              updateFilter={updateFilter}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              // Sorting props
              sortField={''}
              sortDirection={'ASC'}
              onSort={() => {}}
              // UI state props
              showFilters={showFilters}
              onToggleFilters={setShowFilters}
            />
          ) : (
            <Alert variant="info">
              Este colaborador externo não tem tarefas atribuídas.
            </Alert>
          )}
        </div>
      </div>
      {showDetails && externo && (
        <ExternoDetailsCard externo={externo} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default ExternoTarefasPage;

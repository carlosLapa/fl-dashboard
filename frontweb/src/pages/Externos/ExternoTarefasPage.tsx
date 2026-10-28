import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getExternoWithTarefasById } from 'services/externoService';
import { ExternoWithTarefasDTO } from 'types/externo';
import TarefaTable from 'components/Tarefa/TarefaTable';
import ExternoDetailsCard from 'components/Externo/ExternoDetailsCard';
import './externosStyles.scss'; // Using your existing styles
import {
  TarefaWithUserAndProjetoDTO,
  TarefaUpdateFormData,
  TarefaInsertFormData,
  TarefaStatus,
} from 'types/tarefa';
import { useTarefaFilters } from 'hooks/useTarefaFilters';
import {
  arquivarTarefa,
  deleteTarefa,
  updateTarefa,
  updateTarefaStatus,
} from 'services/tarefaService';
import TarefaModal from 'components/Tarefa/TarefaModal';
import TarefaDetailsCard from 'components/Tarefa/TarefaDetailsCard';
import { confirmTarefaDelete } from 'components/Tarefa/confirmTarefaDelete';
import { toast } from 'react-toastify';

const ExternoTarefasPage: React.FC = () => {
  const { externoId } = useParams<{ externoId: string }>();
  const navigate = useNavigate();
  const [externo, setExterno] = useState<ExternoWithTarefasDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);
  const [tarefaForDetails, setTarefaForDetails] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);

  // Use our new hook for filter management
  const { filters, updateFilter, applyFilters, clearFilters } =
    useTarefaFilters();

  // showSpinner is false on post-mutation refreshes so the table doesn't flash
  const fetchExternoWithTarefas = useCallback(
    async (showSpinner = true) => {
      if (!externoId) return;
      if (showSpinner) setIsLoading(true);
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
        if (showSpinner) setIsLoading(false);
      }
    },
    [externoId]
  );

  useEffect(() => {
    fetchExternoWithTarefas();
  }, [fetchExternoWithTarefas]);

  const handleGoBack = () => {
    navigate('/externos');
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const findTarefa = (tarefaId: number) =>
    externo?.tarefas.find((t) => t.id === tarefaId) ?? null;

  const handleEditTarefa = (tarefaId: number) => {
    setSelectedTarefa(findTarefa(tarefaId));
  };

  const handleCloseTarefaModal = () => {
    setSelectedTarefa(null);
  };

  const handleSaveTarefa = async (
    formData: TarefaInsertFormData | TarefaUpdateFormData
  ) => {
    if (!('id' in formData)) return;
    try {
      await updateTarefa(formData.id, formData);
      handleCloseTarefaModal();
      toast.success('Tarefa atualizada com sucesso!');
      await fetchExternoWithTarefas(false);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar tarefa'
      );
    }
  };

  const handleStatusChange = async (
    tarefaId: number,
    newStatus: TarefaStatus
  ) => {
    try {
      await updateTarefaStatus(tarefaId, newStatus);
      toast.success('Status da tarefa atualizado com sucesso!');
      await fetchExternoWithTarefas(false);
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  const handleArchiveTarefa = async (tarefaId: number) => {
    try {
      await arquivarTarefa(tarefaId);
      handleCloseTarefaModal();
      toast.success('Tarefa arquivada com sucesso!');
      await fetchExternoWithTarefas(false);
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao arquivar tarefa'
      );
    }
  };

  const handleDeleteTarefa = async (tarefaId: number) => {
    if (!confirmTarefaDelete()) return;
    try {
      await deleteTarefa(tarefaId);
      // The externo payload is loaded once on mount; drop the row locally
      // instead of refetching the whole externo.
      setExterno((prev) =>
        prev
          ? { ...prev, tarefas: prev.tarefas.filter((t) => t.id !== tarefaId) }
          : prev
      );
      toast.success('Tarefa apagada com sucesso!');
    } catch (error) {
      console.error('Erro ao apagar tarefa:', error);
      toast.error('Erro ao apagar tarefa');
    }
  };

  const handleViewDetails = (tarefaId: number) => {
    setTarefaForDetails(findTarefa(tarefaId));
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
      <div className="page-container">
        <div
          className="page-shell"
          style={{ textAlign: 'center', padding: '2rem' }}
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
      <div className="page-container">
        <div className="page-shell">
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
      <div className="page-container">
        <div className="page-shell">
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
    <div className="page-container">
      <div className="page-shell">
        <div className="page-title-container page-title-container--externo page-title-container--scroll-table">
          <h2 className="page-title page-title--externo">
            Tarefas de {externo.name}
          </h2>
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
              tarefas={externo.tarefas}
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
      {selectedTarefa && (
        <TarefaModal
          show={true}
          onHide={handleCloseTarefaModal}
          tarefa={selectedTarefa}
          onSave={handleSaveTarefa}
          onStatusChange={handleStatusChange}
          onArchive={handleArchiveTarefa}
          isEditing={true}
        />
      )}
      {tarefaForDetails && (
        <TarefaDetailsCard
          tarefa={tarefaForDetails}
          onClose={() => setTarefaForDetails(null)}
        />
      )}
    </div>
  );
};

export default ExternoTarefasPage;

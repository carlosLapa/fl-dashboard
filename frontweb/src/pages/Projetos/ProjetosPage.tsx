import React, { useState, useEffect, useCallback } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { fetchProjetosWithFilters } from '../../services/projetoService';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import { Button } from 'react-bootstrap';
import ProjetoModal from 'components/Projeto/ProjetoModal';
import {
  addProjetoAPI,
  updateProjetoAPI,
  deleteProjetoAPI,
  searchProjetosAPI,
  getProjetosAPI,
} from 'api/requestsApi';
import { NotificationInsertDTO, NotificationType } from 'types/notification';
import { useNotification } from 'NotificationContext';
import { useAuth } from '../../AuthContext';
import { usePermissions } from 'hooks/usePermissions'; // Add this import
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useProjetoFilters } from '../../hooks/useFilterState';
import { Badge } from 'react-bootstrap';
import { hasActiveFilters } from '../../components/Projeto/utils/filterUtils';
import './projetosStyles.scss';

const ProjetosPage: React.FC = () => {
  const { user } = useAuth();
  const { sendNotification } = useNotification();
  const { isEmployee } = usePermissions(); // Add this hook

  // Check if user is an employee (not admin or manager)
  const shouldDisableActions = isEmployee();

  // Define disabled style for the button
  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  // Use our custom hook for filter state management
  const {
    filters,
    appliedFilters,
    isFiltered,
    updateFilter,
    applyFilters,
    clearFilters,
  } = useProjetoFilters();

  // Data state
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting states
  const [sortField, setSortField] = useState<string>('designacao');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Data fetching function for all projetos
  const fetchProjetos = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all projetos');
      const response = await getProjetosAPI(
        page,
        pageSize,
        sortField,
        sortDirection
      );
      setProjetos(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortField, sortDirection]);

  // Data fetching function for filtered projetos
  const fetchFilteredProjetos = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching filtered projetos');
      console.log('Applying filters:', JSON.stringify(appliedFilters, null, 2));
      console.log('With sort:', sortField, sortDirection);
      
      // Debug clienteId especificamente
      if (appliedFilters.clienteId !== undefined) {
        console.log(`clienteId filtro: ${appliedFilters.clienteId} (${typeof appliedFilters.clienteId})`);
      }
      
      const response = await fetchProjetosWithFilters(
        appliedFilters,
        page,
        pageSize,
        sortField,
        sortDirection
      );
      
      if (response && response.data) {
        console.log(`Projetos encontrados: ${response.data.content?.length || 0}`);
        setProjetos(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        console.warn('Resposta sem dados válidos');
        setProjetos([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Erro ao filtrar projetos:', error);
      toast.error('Erro ao filtrar projetos');
      setProjetos([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, page, pageSize, sortField, sortDirection]);

  // This effect handles data fetching based on current state
  useEffect(() => {
    // Simple flag to prevent double fetching
    let isMounted = true;
    const doFetch = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        if (searchQuery) {
          console.log('Fetching projects with search query');
          const response = await searchProjetosAPI(
            searchQuery,
            appliedFilters.status,
            page,
            pageSize,
            sortField,
            sortDirection
          );
          if (isMounted) {
            setProjetos(response.content);
            setTotalPages(response.totalPages);
          }
        } else if (isFiltered) {
          await fetchFilteredProjetos();
        } else {
          await fetchProjetos();
        }
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        if (isMounted) {
          toast.error('Erro ao carregar projetos');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    doFetch();
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [
    page,
    pageSize,
    isFiltered,
    sortField,
    sortDirection,
    searchQuery,
    appliedFilters,
    fetchFilteredProjetos,
    fetchProjetos,
  ]);

  // Filter handlers
  const handleApplyFilters = useCallback(() => {
    console.log('handleApplyFilters called with filters:', filters);
    
    // Debug para clienteId especificamente
    console.log('clienteId antes de aplicar:', filters.clienteId, 'tipo:', typeof filters.clienteId);
    console.log('cliente nome antes de aplicar:', filters.cliente);
    
    const success = applyFilters();

    if (!success) {
      toast.warning('Por favor, selecione pelo menos um filtro para aplicar');
      return;
    }

    // Log dos filtros aplicados
    console.log('Filtros aplicados com sucesso:', appliedFilters);
    console.log('clienteId após aplicar:', appliedFilters.clienteId, 'tipo:', typeof appliedFilters.clienteId);

    // Reset to page 0 when applying filters
    setPage(0);

    // Important: Clear search query when applying filters
    setSearchQuery('');
  }, [filters, applyFilters, appliedFilters]);

  // CRUD operations
  const handleEditProjeto = useCallback(
    (id: number) => {
      const projeto = projetos.find((p) => p.id === id);
      if (projeto) {
        setProjetoToEdit(projeto);
        setShowModal(true);
      }
    },
    [projetos]
  );

  const handleAddNewProjeto = useCallback(() => {
    // Add check for employee permissions
    if (shouldDisableActions) return;

    setProjetoToEdit(null);
    setShowModal(true);
  }, [shouldDisableActions]); // Add dependency

  const handleDeleteProjeto = useCallback(
    async (id: number) => {
      try {
        await deleteProjetoAPI(id);
        if (isFiltered) {
          await fetchFilteredProjetos();
        } else {
          await fetchProjetos();
        }
        toast.success('Projeto excluído com sucesso');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Erro ao excluir projeto');
      }
    },
    [isFiltered, fetchFilteredProjetos, fetchProjetos]
  );

  const handleAddOrUpdateProjeto = useCallback(
    async (formData: ProjetoFormData) => {
      try {
        if (projetoToEdit) {
          await updateProjetoAPI(projetoToEdit.id, formData);
          setTimeout(() => {
            formData.users.forEach((user) => {
              const notification: NotificationInsertDTO = {
                type: NotificationType.PROJETO_ATUALIZADO,
                content: `Projeto "${formData.designacao}" foi atualizado`,
                userId: user.id,
                projetoId: projetoToEdit.id,
                tarefaId: 0,
                isRead: false,
                createdAt: new Date().toISOString(),
                relatedId: projetoToEdit.id,
              };
              sendNotification(notification);
            });
          }, 500);
          toast.success('Projeto atualizado com sucesso');
        } else {
          const newProjeto = await addProjetoAPI(formData);
          if (newProjeto && newProjeto.id) {
            sendNotification({
              type: NotificationType.PROJETO_ATRIBUIDO,
              content: `Novo projeto atribuído: ${newProjeto.designacao}`,
              userId: user?.id || 0,
              projetoId: newProjeto.id,
              tarefaId: 0,
              relatedId: 0,
              isRead: false,
              createdAt: new Date().toISOString(),
            });
          }
          toast.success('Projeto criado com sucesso');
        }
        if (isFiltered) {
          await fetchFilteredProjetos();
        } else {
          await fetchProjetos();
        }
        setShowModal(false);
      } catch (error) {
        console.error('Error adding/updating project:', error);
        toast.error('Erro ao salvar projeto');
      }
    },
    [
      projetoToEdit,
      sendNotification,
      user,
      isFiltered,
      fetchFilteredProjetos,
      fetchProjetos,
    ]
  );

  // Sorting handler
  const handleSort = useCallback(
    (field: string) => {
      // If clicking the same field, toggle direction
      if (field === sortField) {
        setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
      } else {
        // If clicking a new field, set it as the sort field and default to ASC
        setSortField(field);
        setSortDirection('ASC');
      }
    },
    [sortField, sortDirection]
  );

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      {/* Wrap the content in a div with consistent width and margins */}
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
          <h2 className="page-title">
            Gestão de Projetos
            {isFiltered && hasActiveFilters(appliedFilters) && (
              <Badge
                bg="info"
                className="ms-2"
                style={{ fontSize: '0.6em', verticalAlign: 'middle' }}
              >
                Filtros Aplicados
              </Badge>
            )}
          </h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddNewProjeto}
              className="create-button"
              style={shouldDisableActions ? disabledStyle : {}}
              disabled={shouldDisableActions}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Projeto
            </Button>
          </div>
        </div>
        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ProjetoTable
            projetos={projetos}
            onEditProjeto={handleEditProjeto}
            onDeleteProjeto={handleDeleteProjeto}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            filters={filters}
            updateFilter={updateFilter}
            onApplyFilters={handleApplyFilters}
            onClearFilters={clearFilters}
            isLoading={isLoading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            // Note: Not passing shouldDisableActions to the table
          />
        </div>
      </div>
      <ProjetoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        projeto={projetoToEdit}
        onSave={handleAddOrUpdateProjeto}
        isEditing={!!projetoToEdit}
      />
    </div>
  );
};

export default ProjetosPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import {
  getProjetosWithFilters,
  FilterState,
} from '../../services/projetoService';
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
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './projetosStyles.scss';

const ProjetosPage: React.FC = () => {
  const { user } = useAuth();
  const { sendNotification } = useNotification();

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

  // Single filter state object
  const [filters, setFilters] = useState<FilterState>({
    designacao: '',
    entidade: '',
    prioridade: '',
    status: 'ALL',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    designacao: '',
    entidade: '',
    prioridade: '',
    status: 'ALL',
    startDate: '',
    endDate: '',
  });

  // Flag to indicate if filters are applied
  const [isFiltered, setIsFiltered] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>('designacao');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Update a single filter value
  const updateFilter = useCallback((name: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

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
      console.log('Applying filters:', appliedFilters); // Use appliedFilters here
      console.log('With sort:', sortField, sortDirection);
      const response = await getProjetosWithFilters(
        appliedFilters, // Use appliedFilters here
        page,
        pageSize,
        sortField,
        sortDirection
      );
      setProjetos(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao filtrar projetos:', error);
      toast.error('Erro ao filtrar projetos');
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
            filters.status,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const hasFilters = Object.values(filters).some(
      (val, idx) => val !== '' && (idx !== 3 || val !== 'ALL')
    );

    if (!hasFilters) {
      toast.warning('Por favor, selecione pelo menos um filtro para aplicar');
      return;
    }

    // Set the applied filters to the current filter state
    setAppliedFilters(filters);

    // Reset to page 0 when applying filters
    setPage(0);

    // Important: Clear search query when applying filters
    setSearchQuery('');

    // Set isFiltered flag to trigger the useEffect
    setIsFiltered(true);
  }, [filters]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      designacao: '',
      entidade: '',
      prioridade: '',
      status: 'ALL',
      startDate: '',
      endDate: '',
    };

    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setIsFiltered(false);
    setPage(0); // Reset to first page
    setSearchQuery(''); // Clear search query
  }, []);

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
    setProjetoToEdit(null);
    setShowModal(true);
  }, []);

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
          <h2 className="page-title">Gestão de Projetos</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddNewProjeto}
              className="create-button"
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
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
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

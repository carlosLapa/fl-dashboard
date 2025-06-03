import React, { useState, useEffect } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { getProjetosWithFilters } from '../../services/projetoService';
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
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { sendNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [designacaoFilter, setDesignacaoFilter] = useState('');
  const [entidadeFilter, setEntidadeFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>('designacao');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Add a state to track when filters should be applied
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);

  const fetchProjetos = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching projetos with sort:', sortField, sortDirection);
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
  };

  const fetchFilteredProjetos = async () => {
    setIsLoading(true);
    try {
      const filters = {
        designacao: designacaoFilter,
        entidade: entidadeFilter,
        prioridade: prioridadeFilter,
        startDate,
        endDate,
        status: statusFilter,
      };

      console.log('Applying filters:', filters);
      console.log('With sort:', sortField, sortDirection);

      const response = await getProjetosWithFilters(
        filters,
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
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPage(0);
    setIsLoading(true);
    try {
      const response = await searchProjetosAPI(
        query,
        statusFilter,
        page,
        pageSize,
        sortField,
        sortDirection
      );
      setProjetos(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro ao buscar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  // This effect handles data fetching based on current state
  useEffect(() => {
    // Simple flag to prevent double fetching
    let fetchStarted = false;

    const doFetch = async () => {
      if (fetchStarted) return;
      fetchStarted = true;

      if (searchQuery) {
        console.log('Fetching projects with search query');
        await handleSearch(searchQuery);
      } else if (isFiltered) {
        console.log('Fetching filtered projetos');
        await fetchFilteredProjetos();
      } else {
        console.log('Fetching all projetos');
        await fetchProjetos();
      }
    };

    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    isFiltered,
    sortField,
    sortDirection,
    searchQuery,
  ]);

  const handleApplyFilters = () => {
    console.log('handleApplyFilters called with prioridade:', prioridadeFilter);

    const hasFilters =
      !!designacaoFilter ||
      !!entidadeFilter ||
      !!prioridadeFilter ||
      !!startDate ||
      !!endDate ||
      statusFilter !== 'ALL';

    if (!hasFilters) {
      toast.warning('Por favor, selecione pelo menos um filtro para aplicar');
      return;
    }

    // Reset to page 0 when applying filters
    setPage(0);
    setIsFiltered(true);
    // Manually trigger a fetch
    fetchFilteredProjetos();
  };

  const handleClearFilters = () => {
    setDesignacaoFilter('');
    setEntidadeFilter('');
    setPrioridadeFilter('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('ALL');
    setIsFiltered(false);
    // Manually trigger a fetch of unfiltered data
    fetchProjetos();
  };

  const handleEditProjeto = (id: number) => {
    const projeto = projetos.find((p) => p.id === id);
    if (projeto) {
      setProjetoToEdit(projeto);
      setShowModal(true);
    }
  };

  const handleAddNewProjeto = () => {
    setProjetoToEdit(null);
    setShowModal(true);
  };

  const handleDeleteProjeto = async (id: number) => {
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
  };

  const handleAddOrUpdateProjeto = async (formData: ProjetoFormData) => {
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
  };

  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // If clicking a new field, set it as the sort field and default to ASC
      setSortField(field);
      setSortDirection('ASC');
    }
  };

  const onPrioridadeFilterChange = (value: string) => {
    console.log('Changing prioridade filter to:', value);
    setPrioridadeFilter(value);
  };

  // Initial data load
  useEffect(() => {
    fetchProjetos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            designacaoFilter={designacaoFilter}
            entidadeFilter={entidadeFilter}
            prioridadeFilter={prioridadeFilter}
            onDesignacaoFilterChange={setDesignacaoFilter}
            onEntidadeFilterChange={setEntidadeFilter}
            onPrioridadeFilterChange={onPrioridadeFilterChange}
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

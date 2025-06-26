import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  getClienteWithProjetosAndUsersAPI,
  associateProjetoWithClienteAPI,
} from '../../api/clienteApi';
import {
  addProjetoAPI,
  updateProjetoAPI,
  deleteProjetoAPI,
} from '../../api/requestsApi';
import {
  ClienteWithProjetosAndUsersDTO,
} from '../../types/cliente';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import { ProjetoFilterState } from '../../types/filters';
import ProjetoModal from '../../components/Projeto/ProjetoModal';
import { toast } from 'react-toastify';

// Create a cache object outside the component to persist across renders
const apiCache = {
  clienteData: null as ClienteWithProjetosAndUsersDTO | null,
  lastFetchedId: null as number | null,
  isFetching: false,
  // Add a counter to track cache hits for debugging
  cacheHits: 0,
};

const ClienteProjetosPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteWithProjetosAndUsersDTO | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Modal state
  const [showProjetoModal, setShowProjetoModal] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Sorting state
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  // Filter state with the correct structure
  const [filters, setFilters] = useState<ProjetoFilterState>({
    designacao: '',
    status: '',
    entidade: '',
    prioridade: '',
    startDate: '',
    endDate: '',
    cliente: '',
  });
  
  // Use a ref to track component mount state
  const isMountedRef = useRef(false);
  // Use a ref to track if we've already logged cache hits for this render
  const loggedCacheHitRef = useRef(false);

  // Fetch client data with projects and users in a single call
  const fetchClienteData = async (id: number, forceRefresh = false) => {
    // Reset the logged cache hit flag on each fetch attempt
    loggedCacheHitRef.current = false;
    
    // If we're already fetching or have data for this ID and don't need to refresh, use cached data
    if (
      !forceRefresh && 
      apiCache.lastFetchedId === id && 
      apiCache.clienteData !== null &&
      !apiCache.isFetching
    ) {
      // Only log once per component instance to reduce console spam
      if (!loggedCacheHitRef.current) {
        apiCache.cacheHits++;
        console.log(`Using cached client data (hit #${apiCache.cacheHits})`);
        loggedCacheHitRef.current = true;
      }
      
      setCliente(apiCache.clienteData);
      setProjetos(apiCache.clienteData.projetos || []);
      setTotalPages(Math.ceil((apiCache.clienteData.projetos?.length || 0) / 10));
      setLoading(false);
      return;
    }
    
    // If we're already fetching, don't start another fetch
    if (apiCache.isFetching) {
      console.log('Already fetching data, skipping duplicate request');
      return;
    }
    
    apiCache.isFetching = true;
    setLoading(true);
    
    try {
      console.log(`Fetching client data for ID: ${id}`);
      const clienteData = await getClienteWithProjetosAndUsersAPI(id);
      
      if (clienteData) {
        // Update cache
        apiCache.clienteData = clienteData;
        apiCache.lastFetchedId = id;
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setCliente(clienteData);
          setProjetos(clienteData.projetos || []);
          setTotalPages(Math.ceil((clienteData.projetos?.length || 0) / 10));
          console.log('Client data fetched successfully');
        }
      } else {
        if (isMountedRef.current) {
          setError('Cliente não encontrado');
        }
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      if (isMountedRef.current) {
        setError('Erro ao carregar dados do cliente');
      }
    } finally {
      apiCache.isFetching = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Load data when component mounts or clienteId changes
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;
    
    if (clienteId) {
      const id = parseInt(clienteId);
      fetchClienteData(id);
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [clienteId]);

  const handleBack = () => {
    navigate('/clientes');
  };

  const handleAddProjeto = () => {
    setSelectedProjeto(null);
    setShowProjetoModal(true);
  };

  const handleEditProjeto = (projetoId: number) => {
    const projeto = projetos.find((p) => p.id === projetoId);
    if (projeto) {
      setSelectedProjeto(projeto);
      setShowProjetoModal(true);
    } else {
      toast.error('Projeto não encontrado');
    }
  };

  const handleDeleteProjeto = async (projetoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await deleteProjetoAPI(projetoId);
        toast.success('Projeto excluído com sucesso!');
        // Refresh the data
        if (clienteId) {
          const id = parseInt(clienteId);
          // Force refresh
          await fetchClienteData(id, true);
        }
      } catch (error) {
        console.error('Error deleting projeto:', error);
        toast.error('Erro ao excluir projeto');
      }
    }
  };

  const handleSaveProjeto = async (formData: ProjetoFormData) => {
    if (!clienteId) {
      toast.error('ID do cliente não encontrado');
      return;
    }
    try {
      // Add clienteId to the formData
      const formDataWithClient: ProjetoFormData = {
        ...formData,
        clienteId: parseInt(clienteId),
      };
      if (selectedProjeto) {
        // Update existing projeto
        await updateProjetoAPI(selectedProjeto.id, formDataWithClient);
        console.log('Project updated');
        toast.success('Projeto atualizado com sucesso!');
      } else {
        // Create new projeto with client ID already included
        const result = await addProjetoAPI(formDataWithClient);
        console.log('Project created with client ID');
        // If the backend doesn't automatically associate the project with the client,
        // we can explicitly do it here
        if (result && result.id) {
          try {
            await associateProjetoWithClienteAPI(
              parseInt(clienteId),
              result.id
            );
            console.log(
              `Project ${result.id} associated with client ${clienteId}`
            );
          } catch (associationError) {
            console.error(
              'Error associating project with client:',
              associationError
            );
          }
        }
        toast.success('Projeto criado com sucesso!');
      }
      // Close the modal and reset selected project
      setShowProjetoModal(false);
      setSelectedProjeto(null);
      // Refresh the data using the combined endpoint
      const id = parseInt(clienteId);
      // Force refresh
      await fetchClienteData(id, true);
    } catch (error) {
      console.error('Error saving projeto:', error);
      toast.error('Erro ao salvar projeto');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
  };

  const updateFilter = (name: keyof ProjetoFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // In a real app, you would filter the projects based on the filter state
    console.log('Applying filters:', filters);
  };

  const handleClearFilters = () => {
    setFilters({
      designacao: '',
      status: '',
      entidade: '',
      prioridade: '',
      startDate: '',
      endDate: '',
      cliente: '',
    });
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '70vh' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar para Clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projetos do Cliente: {cliente?.name}</h2>
        <Button variant="secondary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar para Clientes
        </Button>
      </div>
      <div className="cliente-info mb-4">
        <h5>Detalhes do Cliente</h5>
        <p>
          <strong>Morada:</strong> {cliente?.morada || 'Não disponível'}
        </p>
        <p>
          <strong>NIF:</strong> {cliente?.nif || 'Não disponível'}
        </p>
        <p>
          <strong>Contacto:</strong> {cliente?.contacto || 'Não disponível'}
        </p>
        <p>
          <strong>Responsável:</strong>{' '}
          {cliente?.responsavel || 'Não disponível'}
        </p>
      </div>
      <Row className="mb-3">
        <Col>
          <h4>Projetos</h4>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleAddProjeto}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Adicionar Projeto
          </Button>
        </Col>
      </Row>
      {projetos.length === 0 ? (
        <Alert variant="info">
          Este cliente não tem projetos associados.{' '}
          <Button
            variant="link"
            onClick={handleAddProjeto}
            className="p-0 ms-2"
          >
            Adicionar um projeto
          </Button>
        </Alert>
      ) : (
        <ProjetoTable
          projetos={projetos}
          onEditProjeto={handleEditProjeto}
          onDeleteProjeto={handleDeleteProjeto}
          isLoading={false}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          filters={filters}
          updateFilter={updateFilter}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}
      {/* Projeto Modal */}
      <ProjetoModal
        show={showProjetoModal}
        onHide={() => setShowProjetoModal(false)}
        projeto={selectedProjeto}
        onSave={handleSaveProjeto}
        isEditing={!!selectedProjeto}
        clienteInfo={
          cliente ? { id: cliente.id, name: cliente.name } : undefined
        }
      />
    </div>
  );
};

export default ClienteProjetosPage;

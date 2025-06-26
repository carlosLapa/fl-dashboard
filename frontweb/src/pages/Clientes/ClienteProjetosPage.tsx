import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getClienteById } from 'services/clienteService';
import { getProjetosByClienteId } from 'services/clienteService';
import { ClienteDTO } from 'types/cliente';
import { Projeto } from 'types/projeto';
import ProjetoTable from 'components/Projeto/ProjetoTable';
import { ProjetoFilterState } from 'types/filters';

const ClienteProjetosPage: React.FC = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Add any other required properties from ProjetoFilterState
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!clienteId) return;

      setLoading(true);
      try {
        const id = parseInt(clienteId);
        const clienteData = await getClienteById(id);
        const projetosData = await getProjetosByClienteId(id);

        if (clienteData) {
          setCliente(clienteData);
          setProjetos(projetosData);
          setTotalPages(Math.ceil(projetosData.length / 10)); // Assuming 10 items per page
        } else {
          setError('Cliente não encontrado');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erro ao carregar dados do cliente e projetos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clienteId]);

  const handleBack = () => {
    navigate('/clientes');
  };

  const handleEditProjeto = (projetoId: number) => {
    // This would typically open an edit modal or navigate to an edit page
    console.log(`Edit projeto ${projetoId}`);
  };

  const handleDeleteProjeto = (projetoId: number) => {
    // This would typically show a confirmation dialog and then delete
    console.log(`Delete projeto ${projetoId}`);
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
      // Reset any other required properties from ProjetoFilterState
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

      <h4>Projetos</h4>
      {projetos.length === 0 ? (
        <Alert variant="info">Este cliente não tem projetos associados.</Alert>
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
    </div>
  );
};

export default ClienteProjetosPage;

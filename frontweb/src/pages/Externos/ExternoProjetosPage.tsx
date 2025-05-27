import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getExternoWithProjetosById } from 'services/externoService';
import { ExternoWithProjetosDTO } from 'types/externo';
import ProjetoTable from 'components/Projeto/ProjetoTable';
import ExternoDetailsCard from 'components/Externo/ExternoDetailsCard';
import './externosStyles.scss'; // Using your existing styles

const ExternoProjetosPage: React.FC = () => {
  const { externoId } = useParams<{ externoId: string }>();
  const navigate = useNavigate();
  const [externo, setExterno] = useState<ExternoWithProjetosDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchExternoWithProjetos = async () => {
      if (externoId) {
        setIsLoading(true);
        try {
          const externoData = await getExternoWithProjetosById(
            Number(externoId)
          );
          setExterno(externoData);
          setError(null);
        } catch (err) {
          console.error('Error loading externo with projetos:', err);
          setError(
            'Falha ao carregar os projetos do colaborador externo. Por favor, tente novamente.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchExternoWithProjetos();
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

  // Empty handlers for ProjetoTable props
  const handleEditProjeto = (id: number) => {
    console.log(`Edit projeto ${id} - Not implemented in this view`);
  };

  const handleDeleteProjeto = (id: number) => {
    console.log(`Delete projeto ${id} - Not implemented in this view`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  if (isLoading) {
    return (
      <Container fluid className="page-container">
        <div className="text-center p-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="page-container">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar para Colaboradores Externos
        </Button>
      </Container>
    );
  }

  if (!externo) {
    return (
      <Container fluid className="page-container">
        <Alert variant="warning">Colaborador externo não encontrado.</Alert>
        <Button variant="secondary" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar para Colaboradores Externos
        </Button>
      </Container>
    );
  }

  // Calculate total pages based on the number of projetos
  const totalPages = externo.projetos
    ? Math.ceil(externo.projetos.length / 10)
    : 1;

  return (
    <Container fluid className="page-container">
      <div className="page-title-container">
        <h2 className="page-title">Projetos de {externo.name}</h2>
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

      <div className="table-responsive mt-4">
        {externo.projetos && externo.projetos.length > 0 ? (
          <ProjetoTable
            projetos={externo.projetos}
            onEditProjeto={handleEditProjeto}
            onDeleteProjeto={handleDeleteProjeto}
            page={page}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            // These props might be required by your ProjetoTable component
            startDate=""
            endDate=""
            onStartDateChange={() => {}}
            onEndDateChange={() => {}}
            designacaoFilter=""
            entidadeFilter=""
            prioridadeFilter=""
            onDesignacaoFilterChange={() => {}}
            onEntidadeFilterChange={() => {}}
            onPrioridadeFilterChange={() => {}}
            onApplyFilters={() => {}}
            onClearFilters={() => {}}
          />
        ) : (
          <Alert variant="info">
            Este colaborador externo não está associado a nenhum projeto.
          </Alert>
        )}
      </div>

      {showDetails && externo && (
        <ExternoDetailsCard externo={externo} onClose={handleCloseDetails} />
      )}
    </Container>
  );
};

export default ExternoProjetosPage;

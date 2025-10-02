import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { getPropostaWithClientes } from '../../services/propostaService';
import { Proposta } from '../../types/proposta';
import PropostaDetailsTable from '../../components/Proposta/PropostaDetailsTable';
import { toast } from 'react-toastify';
import BackButton from '../../components/Shared/BackButton/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { converterParaProjeto } from '../../services/propostaService';
import { useNavigate } from 'react-router-dom';
import { Permission } from '../../permissions/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';

import './propostaDetailsPage.scss';

const PropostaDetailsPage: React.FC = () => {
  const { propostaId } = useParams<{ propostaId: string }>();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const fetchProposta = async () => {
    if (propostaId) {
      setIsLoading(true);
      try {
        const fetchedProposta = await getPropostaWithClientes(
          Number(propostaId)
        );
        setProposta(fetchedProposta);
        setError(null);
      } catch (error) {
        console.error('Erro ao carregar detalhes da proposta:', error);
        setError('Erro ao carregar detalhes da proposta');
        toast.error('Erro ao carregar detalhes da proposta');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProposta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propostaId]);

  // A funcionalidade de alteração de status foi removida desta página

  const handleConverterParaProjeto = async () => {
    if (!hasPermission(Permission.ADJUDICAR_PROPOSTA)) {
      toast.error('Sem permissão para converter proposta em projeto');
      return;
    }

    if (propostaId && proposta) {
      try {
        const projetoCriado = await converterParaProjeto(Number(propostaId));
        toast.success('Projeto criado com sucesso!');

        // Atualiza a proposta para refletir o novo projetoId
        await fetchProposta();

        toast.info(
          'A proposta foi convertida em projeto e não pode ser convertida novamente.'
        );

        if (projetoCriado && projetoCriado.id) {
          navigate(`/projetos/${projetoCriado.id}/details`);
        }
      } catch (error) {
        toast.error('Erro ao converter proposta para projeto');
        console.error('Erro na conversão:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!proposta) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Proposta não encontrada</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 proposta-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Detalhes da Proposta</h2>
        <div className="d-flex">
          <div className="me-2">
            <BackButton to="/propostas" />
          </div>

          {/* Botão para converter em projeto, apenas mostrado se a proposta estiver adjudicada e não tiver projeto associado */}
          {proposta.status === 'ADJUDICADA' &&
            !proposta.projetoId &&
            hasPermission(Permission.ADJUDICAR_PROPOSTA) && (
              <Button
                variant="primary"
                onClick={handleConverterParaProjeto}
                className="ms-2"
              >
                <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                Converter em Projeto
              </Button>
            )}
        </div>
      </div>

      <Row className="mb-4">
        <Col>
          <div className="details-table-wrapper">
            <PropostaDetailsTable proposta={proposta} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PropostaDetailsPage;

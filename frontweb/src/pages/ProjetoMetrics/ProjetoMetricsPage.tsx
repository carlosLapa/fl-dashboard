import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faTasks,
  faCheckCircle,
  faSpinner,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import { getProjetoMetrics } from '../../services/projetoMetricsService';
import MetricsKpiCard from '../../components/ProjetoMetrics/MetricsKpiCard';
import StatusDistributionChart from '../../components/ProjetoMetrics/StatusDistributionChart';
import CollaboratorMetricsTable from '../../components/ProjetoMetrics/CollaboratorMetricsTable';
import LongestTasksTable from '../../components/ProjetoMetrics/LongestTasksTable';
import CollaboratorPerformanceChart from '../../components/ProjetoMetrics/CollaboratorPerformanceChart';
import './ProjetoMetricsPage.scss';

const ProjetoMetricsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [metrics, setMetrics] = useState<ProjetoMetricsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics data
  const fetchMetrics = useCallback(async () => {
    if (!id) {
      setError('ID do projeto não fornecido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getProjetoMetrics(Number(id));
      setMetrics(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar métricas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    navigate('/projetos');
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div className="metrics-content">
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">A Carregar métricas...</span>
            </Spinner>
            <p className="mt-3 text-muted">A Carregar métricas do projeto...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !metrics) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div className="metrics-content">
          <Alert variant="danger">
            <Alert.Heading>Erro ao Carregar Métricas</Alert.Heading>
            <p>
              {error || 'Não foi possível carregar as métricas do projeto.'}
            </p>
            <hr />
            <div className="d-flex justify-content-between">
              <Button variant="outline-danger" onClick={handleGoBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Voltar aos Projetos
              </Button>
              <Button variant="primary" onClick={fetchMetrics}>
                Tentar Novamente
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Success state - render metrics
  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      <div className="metrics-content">
        {/* Page Header */}
        <div className="page-title-container mb-4">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleGoBack}
              className="me-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <div>
              <h2 className="page-title mb-1">
                Métricas do Projeto: {metrics.designacao}
              </h2>
              <p className="text-muted mb-0">
                Análise de desempenho e estatísticas detalhadas
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <MetricsKpiCard
              label="Total de Tarefas"
              value={metrics.totalTarefas}
              icon={<FontAwesomeIcon icon={faTasks} />}
            />
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <MetricsKpiCard
              label="Tarefas Concluídas"
              value={metrics.tarefasConcluidas}
              variant="success"
              badge={{
                text: `${metrics.taxaConclusao.toFixed(1)}%`,
                variant: 'success',
              }}
              icon={<FontAwesomeIcon icon={faCheckCircle} />}
            />
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <MetricsKpiCard
              label="Em Progresso"
              value={metrics.tarefasEmProgresso}
              variant="warning"
              icon={<FontAwesomeIcon icon={faSpinner} />}
            />
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <MetricsKpiCard
              label="Tempo Médio"
              value={metrics.tempoMedioDias.toFixed(1)}
              variant="info"
              footer="dias úteis"
              icon={<FontAwesomeIcon icon={faClock} />}
            />
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="g-3 mb-4">
          <Col xs={12} lg={6}>
            <StatusDistributionChart metrics={metrics} />
          </Col>
          <Col xs={12} lg={6}>
            <CollaboratorPerformanceChart metrics={metrics} />
          </Col>
        </Row>

        {/* Tables Row */}
        <Row className="g-3">
          <Col xs={12}>
            <CollaboratorMetricsTable metrics={metrics} />
          </Col>
        </Row>

        <Row className="g-3 mt-3">
          <Col xs={12}>
            <LongestTasksTable metrics={metrics} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProjetoMetricsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import {
  getProjetoMetrics,
  canViewProjetoMetrics,
} from '../../services/projetoMetricsService';
import './ProjetoMetricsPage.scss';

const ProjetoMetricsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [metrics, setMetrics] = useState<ProjetoMetricsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Permission check
  const canViewMetrics = canViewProjetoMetrics();

  // Fetch metrics data
  const fetchMetrics = useCallback(async () => {
    if (!id) {
      setError('ID do projeto não fornecido');
      setIsLoading(false);
      return;
    }

    if (!canViewMetrics) {
      setError('Você não tem permissão para visualizar métricas de projetos');
      setIsLoading(false);
      toast.error('Acesso negado: permissão insuficiente');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[ProjetoMetricsPage] Fetching metrics for projeto ${id}`);
      const data = await getProjetoMetrics(Number(id));
      setMetrics(data);
      console.log('[ProjetoMetricsPage] Metrics loaded successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar métricas';
      console.error('[ProjetoMetricsPage] Error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id, canViewMetrics]);

  // Initial data fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    navigate('/projetos');
  }, [navigate]);

  // Permission denied state
  if (!canViewMetrics) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div className="metrics-content">
          <Alert variant="danger">
            <Alert.Heading>Acesso Negado</Alert.Heading>
            <p>
              Você não tem permissão para visualizar métricas de projetos. Esta
              funcionalidade requer permissão <strong>VIEW_ALL_PROJECTS</strong>
              .
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" onClick={handleGoBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Voltar aos Projetos
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div className="metrics-content">
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Carregando métricas...</span>
            </Spinner>
            <p className="mt-3 text-muted">Carregando métricas do projeto...</p>
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
        <div className="page-title-container">
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
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Métricas do Projeto
              </h2>
              <p className="text-muted mb-0">{metrics.projetoNome}</p>
            </div>
          </div>
        </div>

        {/* Metrics Overview - KPI Cards */}
        <Row className="mt-4 g-3">
          <Col xs={12} sm={6} lg={3}>
            <Card className="metrics-card">
              <Card.Body>
                <div className="metrics-card-header">
                  <span className="metrics-card-label">Total de Tarefas</span>
                </div>
                <div className="metrics-card-value">{metrics.totalTarefas}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="metrics-card metrics-card-success">
              <Card.Body>
                <div className="metrics-card-header">
                  <span className="metrics-card-label">Tarefas Concluídas</span>
                </div>
                <div className="metrics-card-value">
                  {metrics.tarefasConcluidas}
                </div>
                <div className="metrics-card-footer">
                  <Badge bg="success">
                    {metrics.taxaConclusao.toFixed(1)}%
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="metrics-card metrics-card-warning">
              <Card.Body>
                <div className="metrics-card-header">
                  <span className="metrics-card-label">Em Progresso</span>
                </div>
                <div className="metrics-card-value">
                  {metrics.tarefasEmProgresso}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="metrics-card metrics-card-info">
              <Card.Body>
                <div className="metrics-card-header">
                  <span className="metrics-card-label">Tempo Médio</span>
                </div>
                <div className="metrics-card-value">
                  {metrics.tempoMedioDias.toFixed(1)}
                </div>
                <div className="metrics-card-footer">
                  <small className="text-muted">dias úteis</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Placeholder for future components */}
        <Row className="mt-4">
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Card.Title>Distribuição por Status</Card.Title>
                <Alert variant="info" className="mb-0">
                  Componente de gráfico será implementado em breve
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={12} lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Métricas por Colaborador</Card.Title>
                <Alert variant="info" className="mb-0">
                  Tabela de colaboradores será implementada em breve
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card>
              <Card.Body>
                <Card.Title>Tarefas Mais Longas</Card.Title>
                <Alert variant="info" className="mb-0">
                  Top 10 tarefas será implementado em breve
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProjetoMetricsPage;

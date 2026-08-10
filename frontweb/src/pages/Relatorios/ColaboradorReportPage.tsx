import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { CollaboratorGlobalMetricsDTO } from '../../types/colaboradorReport';
import { getColaboradorGlobalMetrics } from '../../services/colaboradorReportService';
import ColaboradorGlobalMetricsTable from '../../components/Relatorios/ColaboradorGlobalMetricsTable';

const ColaboradorReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<
    CollaboratorGlobalMetricsDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getColaboradorGlobalMetrics();
      setColaboradores(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar relatório';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleViewHistory = useCallback(
    (colaboradorId: number) => {
      navigate(`/users/${colaboradorId}/projeto-history`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            width: '94%',
            marginLeft: '2%',
            marginRight: '4%',
            marginTop: '2rem',
          }}
        >
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">A carregar relatório...</span>
            </Spinner>
            <p className="mt-3 text-muted">
              A carregar relatório de colaboradores...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div
          style={{
            width: '94%',
            marginLeft: '2%',
            marginRight: '4%',
            marginTop: '2rem',
          }}
        >
          <Alert variant="danger">
            <Alert.Heading>Erro ao Carregar Relatório</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={fetchMetrics}>
                Tentar Novamente
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      <div
        style={{
          width: '94%',
          marginLeft: '2%',
          marginRight: '4%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <div>
            <h2
              className="page-title mb-1"
              style={{ textAlign: 'left' }}
            >
              Relatório de Colaboradores
            </h2>
            <p className="text-muted mb-0">
              Totais de tarefas por colaborador, agregadas em todos os
              projetos
            </p>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ColaboradorGlobalMetricsTable
            colaboradores={colaboradores}
            onViewHistory={handleViewHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default ColaboradorReportPage;

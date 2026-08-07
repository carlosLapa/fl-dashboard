import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { CollaboratorGlobalMetricsDTO } from '../../types/colaboradorReport';
import { getColaboradorGlobalMetrics } from '../../services/colaboradorReportService';
import ColaboradorGlobalMetricsTable from '../../components/Relatorios/ColaboradorGlobalMetricsTable';
import './ColaboradorReportPage.scss';

const ColaboradorReportPage: React.FC = () => {
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

  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div className="colaborador-report-content">
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
        <div className="colaborador-report-content">
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
      <div className="colaborador-report-content">
        <div className="page-title-container mb-4">
          <div>
            <h2 className="page-title mb-1">Relatório de Colaboradores</h2>
            <p className="text-muted mb-0">
              Totais de tarefas por colaborador, agregados em todos os
              projetos
            </p>
          </div>
        </div>

        <ColaboradorGlobalMetricsTable colaboradores={colaboradores} />
      </div>
    </div>
  );
};

export default ColaboradorReportPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { UserExtraHoursBalanceDTO } from '../../types/userExtraHours';
import { getAllUserExtraHoursBalances } from '../../services/userExtraHoursService';
import BancoHorasOverviewTable from '../../components/Relatorios/BancoHorasOverviewTable';
import 'assets/styles/layout.scss';

const BancoHorasReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<
    UserExtraHoursBalanceDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllUserExtraHoursBalances();
      setColaboradores(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar banco de horas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const handleViewDetail = useCallback(
    (userId: number) => {
      navigate(`/users/${userId}/banco-horas`);
    },
    [navigate],
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-shell">
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">A carregar banco de horas...</span>
            </Spinner>
            <p className="mt-3 text-muted">
              A carregar banco de horas dos colaboradores...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-shell">
          <Alert variant="danger">
            <Alert.Heading>Erro ao Carregar Banco de Horas</Alert.Heading>
            <p>{error}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="primary" onClick={fetchBalances}>
                Tentar Novamente
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-shell">
        <div className="page-title-container">
          <div>
            <h2 className="page-title mb-1">Banco de Horas</h2>
            <p className="text-muted mb-0">
              Saldo acumulado de horas extra e faltas por colaborador
            </p>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '3rem' }}>
          <BancoHorasOverviewTable
            colaboradores={colaboradores}
            onViewDetail={handleViewDetail}
          />
        </div>
      </div>
    </div>
  );
};

export default BancoHorasReportPage;

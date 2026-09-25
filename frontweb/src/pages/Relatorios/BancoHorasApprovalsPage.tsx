import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import {
  approveUserExtraHours,
  getPendingUserExtraHours,
  rejectUserExtraHours,
} from 'services/userExtraHoursService';
import { UserExtraHoursDTO } from 'types/userExtraHours';
import BancoHorasApprovalsTable from 'components/Relatorios/BancoHorasApprovalsTable';
import 'assets/styles/layout.scss';

/**
 * ADMIN-only queue: every colaborador's PENDING Banco de Horas entries,
 * approved or rejected here. Reached from BancoHorasReportPage.
 */
const BancoHorasApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<UserExtraHoursDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPendingUserExtraHours();
      setEntries(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao carregar lançamentos pendentes';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = useCallback(async (id: number) => {
    try {
      await approveUserExtraHours(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Lançamento aprovado');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao aprovar lançamento',
      );
    }
  }, []);

  const handleReject = useCallback(async (id: number, reason: string) => {
    try {
      await rejectUserExtraHours(id, reason || undefined);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Lançamento rejeitado');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao rejeitar lançamento',
      );
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/relatorios/banco-horas');
  }, [navigate]);

  return (
    <div className="page-container">
      <div className="page-shell">
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
              <h2 className="page-title mb-1">Aprovações de Banco de Horas</h2>
              <p className="text-muted mb-0">
                Lançamentos por rever antes de contarem para o saldo de cada
                colaborador.
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          {isLoading ? (
            <div className="text-center" style={{ padding: '3rem' }}>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">A carregar...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <Alert.Heading>Erro ao Carregar Pendentes</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={fetchPending}>
                  Tentar Novamente
                </Button>
              </div>
            </Alert>
          ) : (
            <BancoHorasApprovalsTable
              entries={entries}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BancoHorasApprovalsPage;

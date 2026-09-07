import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getUserById } from 'services/userService';
import {
  getUserExtraHoursByUser,
  getUserExtraHoursBalance,
  getUserExtraHoursMonthlySummary,
  getUserExtraHoursWeeklySummary,
} from 'services/userExtraHoursService';
import { User } from 'types/user';
import { UserExtraHoursDTO } from 'types/userExtraHours';
import UserExtraHoursCalendar from 'components/UserExtraHours/UserExtraHoursCalendar';
import BancoHorasSummaryCards from 'components/UserExtraHours/BancoHorasSummaryCards';
import BancoHorasHistoryTable from 'components/UserExtraHours/BancoHorasHistoryTable';
import 'assets/styles/layout.scss';

const currentMonthPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const currentWeekPeriod = () => {
  // ISO week number, matching the backend's WeekFields.ISO calculation
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    );
  return `${target.getFullYear()}-Semana${String(week).padStart(2, '0')}`;
};

const UserBancoHorasPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<UserExtraHoursDTO[]>([]);
  const [saldoAcumulado, setSaldoAcumulado] = useState(0);
  const [totalMesAtual, setTotalMesAtual] = useState(0);
  const [totalSemanaAtual, setTotalSemanaAtual] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('ID do colaborador não fornecido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedUserId = parseInt(userId, 10);
      const year = new Date().getFullYear();
      const [userData, entriesData, balanceData, monthly, weekly] =
        await Promise.all([
          getUserById(parsedUserId),
          getUserExtraHoursByUser(parsedUserId),
          getUserExtraHoursBalance(parsedUserId),
          getUserExtraHoursMonthlySummary(parsedUserId, year),
          getUserExtraHoursWeeklySummary(parsedUserId, year),
        ]);

      setUser(userData);
      setEntries(entriesData);
      setSaldoAcumulado(balanceData.totalHours);
      setTotalMesAtual(
        monthly.find((s) => s.period === currentMonthPeriod())
          ?.totalHours ?? 0,
      );
      setTotalSemanaAtual(
        weekly.find((s) => s.period === currentWeekPeriod())?.totalHours ??
          0,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar banco de horas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGoBack = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-shell">
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">A carregar banco de horas...</span>
            </Spinner>
            <p className="mt-3 text-muted">A carregar banco de horas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-container">
        <div className="page-shell">
          <Alert variant="danger">
            <Alert.Heading>Erro ao Carregar Banco de Horas</Alert.Heading>
            <p>{error || 'Não foi possível carregar o banco de horas.'}</p>
            <hr />
            <div className="d-flex justify-content-between">
              <Button variant="outline-danger" onClick={handleGoBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Voltar
              </Button>
              <Button variant="primary" onClick={fetchData}>
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
              <h2 className="page-title mb-1">Banco de Horas: {user.name}</h2>
              <p className="text-muted mb-0">
                Lançamento e histórico de horas extra e faltas.
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          <BancoHorasSummaryCards
            saldoAcumulado={saldoAcumulado}
            totalMesAtual={totalMesAtual}
            totalSemanaAtual={totalSemanaAtual}
          />
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          <UserExtraHoursCalendar userId={user.id} onChange={fetchData} />
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          <BancoHorasHistoryTable entries={entries} />
        </div>
      </div>
    </div>
  );
};

export default UserBancoHorasPage;

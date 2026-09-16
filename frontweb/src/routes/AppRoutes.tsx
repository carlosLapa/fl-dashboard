import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import WelcomePage from 'pages/Homepage/WelcomePage';
import ProtectedRoute from './ProtectedRoute';
import { Permission } from 'permissions/rolePermissions';
import GlobalLoadingSpinner from '../components/common/GlobalLoadingSpinner';

const ProjetosPage = lazy(() => import('pages/Projetos/ProjetosPage'));
const PropostasPage = lazy(() => import('pages/Propostas/PropostasPage'));
const UsersPage = lazy(() => import('pages/Users/UsersPage'));
const TarefaPage = lazy(() => import('pages/Tarefa/TarefaPage'));
const KanbanBoardPage = lazy(() => import('pages/KanbanBoard/KanbanBoardPage'));
const UsersTarefasPage = lazy(() => import('pages/Users/UsersTarefasPage'));
const UserCalendarPage = lazy(() => import('pages/Users/UserCalendarPage'));
const ProjetoDetailsPage = lazy(
  () => import('pages/Projetos/ProjetoDetailsPage')
);
const PropostaDetailsPage = lazy(
  () => import('pages/Propostas/PropostaDetailsPage')
);
const NotificationsPage = lazy(
  () => import('pages/Notifications/NotificationsPage')
);
const SearchResultsPage = lazy(() => import('pages/Search/SearchResultsPage'));
const ExternosPage = lazy(() => import('pages/Externos/ExternosPage'));
const ExternoTarefasPage = lazy(
  () => import('pages/Externos/ExternoTarefasPage')
);
const ExternoProjetosPage = lazy(
  () => import('pages/Externos/ExternoProjetosPage')
);
const ClientePage = lazy(() => import('pages/Clientes/ClientePage'));
const ClienteProjetosPage = lazy(
  () => import('pages/Clientes/ClienteProjetosPage')
);
const PasswordReset = lazy(() => import('../components/User/PasswordReset'));
const ProjetoMetricsPage = lazy(
  () => import('pages/ProjetoMetrics/ProjetoMetricsPage')
);
const ColaboradorReportPage = lazy(
  () => import('pages/Relatorios/ColaboradorReportPage')
);
const UserProjetoHistoryPage = lazy(
  () => import('pages/Users/UserProjetoHistoryPage')
);
const BancoHorasReportPage = lazy(
  () => import('pages/Relatorios/BancoHorasReportPage')
);
const UserBancoHorasPage = lazy(
  () => import('pages/Users/UserBancoHorasPage')
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<GlobalLoadingSpinner />}>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route
          path="/projetos"
          element={<ProtectedRoute element={<ProjetosPage />} />}
        />
        <Route
          path="/propostas"
          element={
            <ProtectedRoute
              element={<PropostasPage />}
              permissions={[
                Permission.VIEW_ALL_PROPOSTAS,
                Permission.VIEW_ASSIGNED_PROPOSTAS,
              ]}
            />
          }
        />
        <Route
          path="/users"
          element={<ProtectedRoute element={<UsersPage />} />}
        />
        <Route
          path="/tarefas"
          element={<ProtectedRoute element={<TarefaPage />} />}
        />
        <Route
          path="/projetos/:projetoId/full"
          element={<ProtectedRoute element={<KanbanBoardPage />} />}
        />
        <Route
          path="/users/:userId/tarefas"
          element={<ProtectedRoute element={<UsersTarefasPage />} />}
        />
        <Route
          path="/user-calendar/:userId"
          element={<ProtectedRoute element={<UserCalendarPage />} />}
        />
        <Route
          path="/users/:userId/projeto-history"
          element={
            <ProtectedRoute
              element={<UserProjetoHistoryPage />}
              permissions={Permission.VIEW_REPORTS}
            />
          }
        />
        <Route
          path="/users/:userId/banco-horas"
          element={<ProtectedRoute element={<UserBancoHorasPage />} />}
        />
        <Route
          path="/projetos/:projetoId/details"
          element={<ProtectedRoute element={<ProjetoDetailsPage />} />}
        />
        <Route
          path="/propostas/:propostaId/details"
          element={
            <ProtectedRoute
              element={<PropostaDetailsPage />}
              permissions={[
                Permission.VIEW_ALL_PROPOSTAS,
                Permission.VIEW_ASSIGNED_PROPOSTAS,
              ]}
            />
          }
        />
        <Route
          path="/notifications/:userId"
          element={<ProtectedRoute element={<NotificationsPage />} />}
        />
        <Route
          path="/search"
          element={<ProtectedRoute element={<SearchResultsPage />} />}
        />
        <Route
          path="/externos"
          element={<ProtectedRoute element={<ExternosPage />} />}
        />
        <Route
          path="/externos/:externoId/tarefas"
          element={<ProtectedRoute element={<ExternoTarefasPage />} />}
        />
        <Route
          path="/externos/:externoId/projetos"
          element={<ProtectedRoute element={<ExternoProjetosPage />} />}
        />
        {/* Add routes for Clientes */}
        <Route
          path="/clientes"
          element={<ProtectedRoute element={<ClientePage />} />}
        />
        <Route
          path="/clientes/:clienteId/projetos"
          element={<ProtectedRoute element={<ClienteProjetosPage />} />}
        />
        <Route
          path="/projetos/:id/metrics"
          element={<ProtectedRoute element={<ProjetoMetricsPage />} />}
        />
        <Route
          path="/relatorios/colaboradores"
          element={
            <ProtectedRoute
              element={<ColaboradorReportPage />}
              permissions={Permission.VIEW_REPORTS}
            />
          }
        />
        <Route
          path="/relatorios/banco-horas"
          element={
            <ProtectedRoute
              element={<BancoHorasReportPage />}
              permissions={Permission.VIEW_REPORTS}
            />
          }
        />
        <Route
          path="/admin/password-reset"
          element={
            <ProtectedRoute
              element={<PasswordReset />}
              permissions={Permission.MANAGE_USER_PASSWORDS}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

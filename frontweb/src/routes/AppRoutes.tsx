import { Route, Routes } from 'react-router-dom';
import ProjetosPage from 'pages/Projetos/ProjetosPage';
import UsersPage from 'pages/Users/UsersPage';
import TarefaPage from 'pages/Tarefa/TarefaPage';
import WelcomePage from 'pages/Homepage/WelcomePage';
import ProtectedRoute from './ProtectedRoute';
import KanbanBoardPage from 'pages/KanbanBoard/KanbanBoardPage';
import UsersTarefasPage from 'pages/Users/UsersTarefasPage';
import UserCalendarPage from 'pages/Users/UserCalendarPage';
import ProjetoDetailsPage from 'pages/Projetos/ProjetoDetailsPage';
import NotificationsPage from 'pages/Notifications/NotificationsPage';
import SearchResultsPage from 'pages/Search/SearchResultsPage';
import ExternosPage from 'pages/Externos/ExternosPage';
import ExternoTarefasPage from 'pages/Externos/ExternoTarefasPage';
import ExternoProjetosPage from 'pages/Externos/ExternoProjetosPage';
import ClientePage from 'pages/Clientes/ClientePage';
import ClienteProjetosPage from 'pages/Clientes/ClienteProjetosPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/projetos"
        element={<ProtectedRoute element={<ProjetosPage />} />}
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
        path="/projetos/:projetoId/details"
        element={<ProtectedRoute element={<ProjetoDetailsPage />} />}
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
    </Routes>
  );
};

export default AppRoutes;

import { Route, Routes } from 'react-router-dom';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';
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

const AppRoutes = () => {
  return (
    <>
      <NavbarFL />
      <SidebarFL />
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
      </Routes>
    </>
  );
};
export default AppRoutes;

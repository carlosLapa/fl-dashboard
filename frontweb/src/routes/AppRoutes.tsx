import { Route, Routes } from 'react-router-dom';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';
import ProjetosPage from 'pages/Projetos/ProjetosPage';
import UsersPage from 'pages/Users/UsersPage';
import TarefaPage from 'pages/Tarefa/TarefaPage';
import WelcomePage from 'pages/Homepage/WelcomePage';
import ProtectedRoute from './ProtectedRoute';
import KanbanBoardPage from 'pages/KanbanBoard/KanbanBoardPage';

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
      </Routes>
    </>
  );
};
export default AppRoutes;

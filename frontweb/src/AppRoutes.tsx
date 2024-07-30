import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from 'pages/Homepage';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';
import ProjetosPage from 'pages/Projetos/ProjetosPage';
import UsersPage from 'pages/Users/UsersPage';
import KanbanBoardPage from 'pages/KanbanBoard/KanbanBoardPage';

// Routes temporárias

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <NavbarFL />
      <SidebarFL />
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
      <Routes>
        <Route path="/projetos" element={<ProjetosPage />} />
      </Routes>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
      </Routes>
      <Routes>
        <Route
          path="/projetos/:projetoId/kanban"
          element={<KanbanBoardPage />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

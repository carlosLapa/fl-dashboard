import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from 'pages/Homepage';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';
import ProjetosPage from 'pages/Projetos/ProjetosPage';
import UsersPage from 'pages/Users/UsersPage';
import KanbanBoardPage from 'pages/KanbanBoard/KanbanBoardPage';
import TarefaPage from 'pages/Tarefa/TarefaPage';

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
        <Route path="/projetos/:projetoId/full" element={<KanbanBoardPage />} />
      </Routes>
      <Routes>
        <Route path="/tarefas" element={<TarefaPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

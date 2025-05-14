import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.scss';

const SidebarFL: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="sidebar bg-dark">
      <Nav className="flex-column mt-4">
        <Nav.Item>
          <div
            className={`sidebar-link text-light mb-4 ${
              location.pathname.startsWith('/users') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/users')}
            role="button"
            tabIndex={0}
          >
            Colaboradores
          </div>
        </Nav.Item>
        <Nav.Item>
          <div
            className={`sidebar-link text-light mb-4 ${
              location.pathname.startsWith('/projetos') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/projetos')}
            role="button"
            tabIndex={0}
          >
            Projetos
          </div>
        </Nav.Item>
        <Nav.Item>
          <div
            className={`sidebar-link text-light mb-4 ${
              location.pathname.startsWith('/tarefas') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/tarefas')}
            role="button"
            tabIndex={0}
          >
            Tarefas
          </div>
        </Nav.Item>
        <Nav.Item>
          <div
            className={`sidebar-link text-light mb-4 ${
              location.pathname.startsWith('/placeholder') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/placeholder')}
            role="button"
            tabIndex={0}
          >
            Placeholder
          </div>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default SidebarFL;

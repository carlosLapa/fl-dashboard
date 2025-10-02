import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../permissions/rolePermissions';
import './styles.scss';

const SidebarFL: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();
  
  // Verifica se o usuário tem permissão para visualizar propostas
  const canViewPropostas = hasAnyPermission([
    Permission.VIEW_ALL_PROPOSTAS,
    Permission.VIEW_ASSIGNED_PROPOSTAS
  ]);

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
              location.pathname.startsWith('/externos') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/externos')}
            role="button"
            tabIndex={0}
          >
            Colaboradores Externos
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
        {canViewPropostas && (
          <Nav.Item>
            <div
              className={`sidebar-link text-light mb-4 ${
                location.pathname.startsWith('/propostas') ? 'active' : ''
              }`}
              onClick={() => handleNavigation('/propostas')}
              role="button"
              tabIndex={0}
            >
              Propostas
            </div>
          </Nav.Item>
        )}
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
              location.pathname.startsWith('/clientes') ? 'active' : ''
            }`}
            onClick={() => handleNavigation('/clientes')}
            role="button"
            tabIndex={0}
          >
            Clientes
          </div>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default SidebarFL;

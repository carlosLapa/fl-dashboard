import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import './styles.css';

function SidebarFL() {
  return (
    <div className="d-flex">
      <div className="sidebar bg-dark">
        <Nav className="flex-column mt-5">
          <Nav.Item>
            <Link to="/users" className="sidebar-link text-light mb-5">
              Colaboradores
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/projetos" className="sidebar-link text-light mb-5">
              Projetos
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/projetos/:projetoId/full" className="sidebar-link text-light mb-5">
              Tarefas
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/placeholder" className="sidebar-link text-light mb-5">
              Placeholder
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/placeholder" className="sidebar-link text-light mb-5">
              Placeholder
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
}

export default SidebarFL;

import React from 'react';
import Nav from 'react-bootstrap/Nav';
import './styles.css';

function SidebarFL() {
  return (
    <div className="d-flex">
      <div className="sidebar bg-dark">
        <Nav className="flex-column mt-5">
          <Nav.Link href="#action1" className="text-light mb-5">Colaboradores</Nav.Link>
          <Nav.Link href="#action2" className="text-light mb-5">Projetos</Nav.Link>
          <Nav.Link href="#action3" className="text-light mb-5">Propostas</Nav.Link>
          <Nav.Link href="#action4" className="text-light mb-5">Placeholder</Nav.Link>
        </Nav>
      </div>
    </div>
  );
}

export default SidebarFL;

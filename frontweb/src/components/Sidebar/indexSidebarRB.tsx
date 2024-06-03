import React from 'react';
import Nav from 'react-bootstrap/Nav';
import './styles.css';

function SidebarFL() {
  return (
    <div className="d-flex">
      <div className="sidebar bg-dark">
        <Nav className="flex-column mt-4">
          <Nav.Link href="#action1" className="text-light mb-4">Colaboradores</Nav.Link>
          <Nav.Link href="#action2" className="text-light mb-4">Projetos</Nav.Link>
          <Nav.Link href="#action3" className="text-light mb-4">Propostas</Nav.Link>
          <Nav.Link href="#action4" className="text-light mb-4">Another Link</Nav.Link>
        </Nav>
      </div>
      <div className="content flex-grow-1">

      </div>
    </div>
  );
}

export default SidebarFL;

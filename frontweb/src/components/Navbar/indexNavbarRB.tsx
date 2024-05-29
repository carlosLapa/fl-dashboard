import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavScrollExample() {
  return (
    <Navbar expand="lg" className="bg-dark navbar-dark">
      <Container fluid>
        <Navbar.Brand href="#" className="text-light me-5">
          Ferreira Lapa
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="justify-content-between">
          <div className="d-flex me-3">
            <Form className="d-flex me-auto">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-3"
                aria-label="Search"
              />
              <Button variant="outline-light">Search</Button>
            </Form>
          </div>
          <Nav className="my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1" className="text-light me-5">
              Home
            </Nav.Link>
            <Nav.Link href="#action2" className="text-light me-5">
              Link
            </Nav.Link>
            <NavDropdown
              title="Dropdown"
              id="navbarScrollingDropdown"
              className="text-light me-5"
            >
              <NavDropdown.Item href="#action3" className="text-dark">
                Action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action4" className="text-dark">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5" className="text-dark">
                Something else here
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link className="me-3">
              <img
                src="https://via.placeholder.com/32"
                alt="User Avatar"
                className="rounded-circle"
              />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;

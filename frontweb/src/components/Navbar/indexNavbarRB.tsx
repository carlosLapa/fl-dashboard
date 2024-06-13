import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import './styles.css';

function NavbarFL() {
  return (
    <Navbar expand="lg" className="bg-dark navbar-dark custom-navbar sticky-top">
      <Container fluid>
        <Navbar.Brand href="#" className="text-light me-5 ms-3 fl-brand">
          <h3>Ferreira Lapa</h3>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll" className="justify-content-between">
          <div className="d-flex me-3">
            <Form className="d-flex me-auto">
              <Form.Control
                type="search"
                placeholder="Search"
                className="search-textarea"
                aria-label="Search"
                style={{
                  borderRadius: '5px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  width: '25rem',
                }}
              />
              <Button variant="outline-light">Search</Button>
            </Form>
          </div>
          <Nav className="my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1" className="text-light me-5">
              Home
            </Nav.Link>
            <Nav.Link href="#action2" className="text-light me-5">
              Portfolio
            </Nav.Link>
            <NavDropdown
              title="Dropdown exemplo"
              id="navbarScrollingDropdown"
              className="text-light me-5"
            >
              <NavDropdown.Item href="#action3" className="text-dark">
                Uma ação
              </NavDropdown.Item>
              <NavDropdown.Item href="#action4" className="text-dark">
                Outra ação
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5" className="text-dark">
                Algo
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link className="me-3">
              <div
                className="rounded-circle overflow-hidden"
                style={{ width: '35px', height: '35px' }}
              >
                <img
                  src="https://media.licdn.com/dms/image/C4E03AQGZRXblYdcgkA/profile-displayphoto-shrink_100_100/0/1517535613338?e=1723075200&v=beta&t=0aUIXB6ve48VSpaHfnlqvMGiuuXm6vMEckabcbnlJpI"
                  alt="User Avatar"
                  className="w-100 h-100"
                />
              </div>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarFL;

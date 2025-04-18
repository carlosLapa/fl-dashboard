import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import UserInfo from '../User/UserInfo';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

//import LoginModal from '../Login/LoginModal';

import './styles.css';

function NavbarFL() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className="bg-dark navbar-dark custom-navbar sticky-top"
      >
        <Container fluid>
          <Navbar.Brand href="#" className="text-light me-5 ms-3 fl-brand">
            <h3>Ferreira Lapa</h3>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse
            id="navbarScroll"
            className="justify-content-between"
          >
            <div className="d-flex me-3">
              <Form className="d-flex me-auto" onSubmit={handleSearch}>
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="search-textarea"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: '5px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    width: '25rem',
                  }}
                />
                <Button variant="outline-light" type="submit">
                  Search
                </Button>
              </Form>
            </div>
            <Nav className="my-2 my-lg-0" navbarScroll>
              <div className="nav-item-container">
                <a
                  href="https://www.ferreiralapa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="custom-navbar-link text-light me-5"
                >
                  Home
                </a>
                <a
                  href="https://www.ferreiralapa.com/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="custom-navbar-link text-light me-5"
                >
                  Portfolio
                </a>
                {user && <UserInfo />}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarFL;

import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import UserInfo from '../User/UserInfo';
import { useAuth } from '../../AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.scss';

interface NavbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const NavbarFL: React.FC<NavbarProps> = ({ isMobile: propIsMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(propIsMobile || false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    // Initial check
    checkIfMobile();
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [propIsMobile]);

  if (!user) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      // Close mobile navbar after search on mobile
      if (isMobile) {
        setExpanded(false);
      }
    }
  };

  const handleNavLinkClick = (path?: string) => {
    // Close mobile navbar when a link is clicked
    if (isMobile) {
      setExpanded(false);
    }

    // If a path is provided, navigate to it
    if (path) {
      navigate(path);
    }
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Navbar
      expand="lg"
      className="bg-dark navbar-dark custom-navbar sticky-top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="navbar-container">
        <Navbar.Brand href="#" className="text-light brand-container">
          <h3 className="fl-brand">Ferreira Lapa</h3>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbarScroll"
          className="navbar-toggler-custom"
          aria-label="Toggle navigation menu"
        />
        <Navbar.Collapse id="navbarScroll" className="navbar-collapse-custom">
          <div className="search-container">
            <Form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="search-textarea"
                  aria-label="Search input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  variant="outline-light"
                  type="submit"
                  className="search-button"
                >
                  Search
                </Button>
              </div>
            </Form>
          </div>
          <Nav className="nav-links-container" navbarScroll>
            <div className="nav-item-container">
              {/* External links */}
              <a
                href="https://www.ferreiralapa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="custom-navbar-link text-light"
                onClick={() => handleNavLinkClick()}
              >
                Home
              </a>
              <a
                href="https://www.ferreiralapa.com/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="custom-navbar-link text-light"
                onClick={() => handleNavLinkClick()}
              >
                Portfolio
              </a>

              {/* Sidebar links - only shown on mobile */}
              {isMobile && user && (
                <>
                  <div className="sidebar-links-divider"></div>
                  <div
                    className={`custom-navbar-link text-light ${
                      isActive('/users') ? 'active' : ''
                    }`}
                    onClick={() => handleNavLinkClick('/users')}
                  >
                    Colaboradores
                  </div>
                  <div
                    className={`custom-navbar-link text-light ${
                      isActive('/projetos') ? 'active' : ''
                    }`}
                    onClick={() => handleNavLinkClick('/projetos')}
                  >
                    Projetos
                  </div>
                  <div
                    className={`custom-navbar-link text-light ${
                      isActive('/tarefas') ? 'active' : ''
                    }`}
                    onClick={() => handleNavLinkClick('/tarefas')}
                  >
                    Tarefas
                  </div>
                  <div
                    className={`custom-navbar-link text-light ${
                      isActive('/placeholder') ? 'active' : ''
                    }`}
                    onClick={() => handleNavLinkClick('/placeholder')}
                  >
                    Placeholder
                  </div>
                </>
              )}

              {user && (
                <div onClick={() => handleNavLinkClick()}>
                  <UserInfo />
                </div>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarFL;

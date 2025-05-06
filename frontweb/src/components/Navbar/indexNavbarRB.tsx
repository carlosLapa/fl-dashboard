import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import UserInfo from '../User/UserInfo';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './styles.scss';

// Make sure this interface includes onMenuClick
interface NavbarProps {
  onMenuClick: () => void;
}

const NavbarFL: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

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
  }, []);

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

  const handleNavLinkClick = () => {
    // Close mobile navbar when a link is clicked
    if (isMobile) {
      setExpanded(false);
    }
  };

  return (
    <Navbar
      expand="lg"
      className="bg-dark navbar-dark custom-navbar sticky-top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid className="navbar-container">
        {/* Only show menu toggle on mobile */}
        {isMobile && (
          <Button
            variant="outline-light"
            className="menu-toggle-btn me-2"
            onClick={onMenuClick}
            aria-label="Toggle sidebar menu"
          >
            <span className="navbar-toggler-icon"></span>
          </Button>
        )}
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
              <a
                href="https://www.ferreiralapa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="custom-navbar-link text-light"
                onClick={handleNavLinkClick}
              >
                Home
              </a>
              <a
                href="https://www.ferreiralapa.com/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="custom-navbar-link text-light"
                onClick={handleNavLinkClick}
              >
                Portfolio
              </a>
              {user && (
                <div onClick={handleNavLinkClick}>
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

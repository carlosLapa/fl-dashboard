import React, { useCallback } from 'react';
import Nav from 'react-bootstrap/Nav';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './styles.scss';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const SidebarFL: React.FC<SidebarProps> = ({ isOpen, isMobile, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Enhanced link click handler with delayed navigation for mobile
  const handleLinkClick = useCallback(
    (path: string, event: React.MouseEvent) => {
      if (isMobile) {
        event.preventDefault(); // Prevent default link behavior

        // Close sidebar first
        onClose();

        // Navigate after a short delay to ensure the sidebar closing animation completes
        setTimeout(() => {
          navigate(path);
        }, 300); // Match this with your sidebar transition duration
      }
      // On desktop, let the Link component handle navigation normally
    },
    [isMobile, onClose, navigate]
  );

  // Determine sidebar classes based on mobile state and open state
  const sidebarWrapperClasses = [
    'sidebar-wrapper',
    isMobile ? 'mobile' : '',
    isMobile && isOpen ? 'open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={sidebarWrapperClasses}>
      {/* Backdrop for mobile - only shown when sidebar is open */}
      {isMobile && isOpen && (
        <div className="sidebar-backdrop" onClick={onClose}></div>
      )}
      <div className="sidebar bg-dark">
        {/* Close button for mobile */}
        {isMobile && (
          <div className="sidebar-header">
            <button
              className="close-sidebar"
              onClick={onClose}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
        )}
        <Nav className="flex-column mt-4">
          <Nav.Item>
            <Link
              to="/users"
              className={`sidebar-link text-light mb-4 ${
                location.pathname.startsWith('/users') ? 'active' : ''
              }`}
              onClick={(e) => (isMobile ? handleLinkClick('/users', e) : null)}
            >
              Colaboradores
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link
              to="/projetos"
              className={`sidebar-link text-light mb-4 ${
                location.pathname.startsWith('/projetos') ? 'active' : ''
              }`}
              onClick={(e) =>
                isMobile ? handleLinkClick('/projetos', e) : null
              }
            >
              Projetos
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link
              to="/tarefas"
              className={`sidebar-link text-light mb-4 ${
                location.pathname.startsWith('/tarefas') ? 'active' : ''
              }`}
              onClick={(e) =>
                isMobile ? handleLinkClick('/tarefas', e) : null
              }
            >
              Tarefas
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link
              to="/placeholder"
              className={`sidebar-link text-light mb-4 ${
                location.pathname.startsWith('/placeholder') ? 'active' : ''
              }`}
              onClick={(e) =>
                isMobile ? handleLinkClick('/placeholder', e) : null
              }
            >
              Placeholder
            </Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
};

export default SidebarFL;

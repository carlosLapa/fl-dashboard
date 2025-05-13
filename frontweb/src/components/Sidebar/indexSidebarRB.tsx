import React, { useCallback } from 'react';
import Nav from 'react-bootstrap/Nav';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.scss';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const SidebarFL: React.FC<SidebarProps> = ({
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle navigation with direct imperative approach
  const handleNavigation = useCallback(
    (path: string) => {
      // First close the sidebar (on mobile)
      if (isMobile) {
        onClose();
      }

      // Use setTimeout to ensure the sidebar close animation has time to start
      // before navigation, which can sometimes block UI updates
      setTimeout(() => {
        navigate(path);
      }, 10);
    },
    [isMobile, onClose, navigate]
  );

  return (
    <>
      {/* Visible edge/handle when sidebar is collapsed on mobile */}
      {isMobile && !isOpen && (
        <div className="sidebar-handle" onClick={onToggle}>
          <div className="handle-indicator"></div>
        </div>
      )}

      <div
        className={`sidebar-wrapper ${isMobile ? 'mobile' : ''} ${
          isMobile && isOpen ? 'open' : ''
        }`}
      >
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
                  location.pathname.startsWith('/projetos') ? 'active' : ''
                }`}
                onClick={() => handleNavigation('/projetos')}
                role="button"
                tabIndex={0}
              >
                Projetos
              </div>
            </Nav.Item>

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
                  location.pathname.startsWith('/placeholder') ? 'active' : ''
                }`}
                onClick={() => handleNavigation('/placeholder')}
                role="button"
                tabIndex={0}
              >
                Placeholder
              </div>
            </Nav.Item>
          </Nav>
        </div>
      </div>
    </>
  );
};

export default SidebarFL;

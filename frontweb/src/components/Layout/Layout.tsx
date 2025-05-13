import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';
import { useLocation } from 'react-router-dom';
import './Layout.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const { user } = useAuth();
  const location = useLocation();

  // Check if we're on the welcome page
  const isWelcomePage =
    location.pathname === '/' || location.pathname === '/welcome';

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

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Determine main content classes
  const mainContentClasses = [
    'main-content',
    isMobile ? 'mobile' : '',
    sidebarOpen && isMobile ? 'sidebar-open' : '',
    !user ? 'no-sidebar' : '',
    isWelcomePage ? 'welcome-page' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Determine app container classes
  const appContainerClasses = [
    'app-container',
    isWelcomePage ? 'welcome-page-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={appContainerClasses}>
      <NavbarFL />
      <div className="content-wrapper">
        {/* Only render sidebar if user is logged in */}
        {user && (
          <SidebarFL
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={closeSidebar}
            onToggle={toggleSidebar}
          />
        )}
        <div className={mainContentClasses}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;

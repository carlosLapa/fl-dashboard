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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Check if we're on the welcome page
  const isWelcomePage =
    location.pathname === '/' || location.pathname === '/welcome';

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      // Auto-close the off-canvas sidebar once the viewport is desktop-sized
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    // Initial check
    checkIfMobile();
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close the mobile sidebar whenever the route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Apply welcome-page-active class to both body and html when on welcome page
  useEffect(() => {
    if (isWelcomePage) {
      document.body.classList.add('welcome-page-active');
      document.documentElement.classList.add('welcome-page-active');
    } else {
      document.body.classList.remove('welcome-page-active');
      document.documentElement.classList.remove('welcome-page-active');
    }

    return () => {
      document.body.classList.remove('welcome-page-active');
      document.documentElement.classList.remove('welcome-page-active');
    };
  }, [isWelcomePage]);

  // Determine main content classes
  const mainContentClasses = [
    'main-content',
    isMobile ? 'mobile' : '',
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
      {!isWelcomePage && (
        <NavbarFL
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen((open) => !open)}
        />
      )}
      <div className="content-wrapper">
        {!isWelcomePage && user && (
          <SidebarFL
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <div className={mainContentClasses}>{children}</div>
      </div>
      {isWelcomePage && <NavbarFL isMobile={isMobile} />}
    </div>
  );
};

export default Layout;

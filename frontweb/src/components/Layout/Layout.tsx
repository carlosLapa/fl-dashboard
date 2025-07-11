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
      {!isWelcomePage && <NavbarFL isMobile={isMobile} />}
      <div className="content-wrapper">
        {!isWelcomePage && user && <SidebarFL />}
        <div className={mainContentClasses}>{children}</div>
      </div>
      {isWelcomePage && <NavbarFL isMobile={isMobile} />}
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import NavbarFL from 'components/Navbar/indexNavbarRB';
import SidebarFL from 'components/Sidebar/indexSidebarRB';

import './Layout.scss';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If user is not logged in, just render the children without navbar or sidebar
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <NavbarFL onMenuClick={toggleSidebar} />
      <div className="content-wrapper">
        {/* Only render sidebar if user is logged in */}
        {user && (
          <SidebarFL
            isOpen={sidebarOpen}
            isMobile={isMobile}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main
          className={`main-content ${isMobile ? 'mobile' : ''} ${
            sidebarOpen && isMobile ? 'sidebar-open' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

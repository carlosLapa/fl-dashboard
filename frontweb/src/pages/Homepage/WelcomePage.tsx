import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import LoginModal from 'components/Login/LoginModal';
import backgroundVideo from '../../assets/videos/background.mp4';
import logoImage from '../../assets/images/logo.png'; // Add your logo image
import './styles.scss';

const WelcomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleHideLoginModal = () => setShowLoginModal(false);

  return (
    <div className="welcome-page-container">
      <div className="hero-container">
        {/* Show video only on non-mobile devices */}
        {!isMobile ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
            data-video="0"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          /* Show logo container on mobile */
          <div className="mobile-logo-container">
            <img src={logoImage} alt="Ferreira Lapa" className="logo-image" />
          </div>
        )}

        <div className="hero-overlay">
          <div className="hero-content">
            <Button
              variant="primary"
              onClick={handleShowLoginModal}
              className="login-button"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
      <LoginModal show={showLoginModal} onHide={handleHideLoginModal} />
    </div>
  );
};

export default WelcomePage;

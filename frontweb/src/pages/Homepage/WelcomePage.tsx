import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import LoginModal from 'components/Login/LoginModal';
import backgroundVideo from '../../assets/videos/background.mp4';
import './styles.css';

const WelcomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleHideLoginModal = () => setShowLoginModal(false);

  return (
    <div className="hero-container">
      <video autoPlay loop muted className="hero-video">
        <source src={backgroundVideo} type="video/mp4" />
      </video>

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

      <LoginModal show={showLoginModal} onHide={handleHideLoginModal} />
    </div>
  );
};

export default WelcomePage;

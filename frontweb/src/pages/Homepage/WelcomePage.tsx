import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import LoginModal from 'components/Login/LoginModal';
import backgroundVideo from '../../assets/videos/background.mp4';
import logoImage from '../../assets/images/logo.png'; // Add your logo image
import './styles.scss';

// If the hero video hasn't become playable within this window (e.g. a degraded connection —
// see the VPN/HTTP3 investigation), we stop waiting and fall back to the static logo instead
// of leaving visitors staring at a blank/frozen hero area.
const VIDEO_READY_TIMEOUT_MS = 2000;

const WelcomePage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [videoTimedOut, setVideoTimedOut] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const videoReadyRef = useRef(false);

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

  // Give the video a limited window to actually start rendering frames; if it hasn't fired
  // onPlaying by then (checked via a ref, not state, so this effect only needs to run once),
  // fall back to the static logo instead of leaving visitors staring at a blank/frozen hero
  // area. Deliberately NOT onCanPlay/onLoadedData: those fire once enough data is buffered to
  // start, which under a throttled connection can be well before the video is actually visible
  // — the browser then stalls waiting for more data, leaving the hero area blank while our
  // logic would already think the video was "ready" and never fall back.
  useEffect(() => {
    if (isMobile) return;

    const timer = setTimeout(() => {
      if (!videoReadyRef.current) {
        setVideoTimedOut(true);
      }
    }, VIDEO_READY_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isMobile]);

  const handleVideoReady = () => {
    videoReadyRef.current = true;
  };

  const handleShowLoginModal = () => setShowLoginModal(true);
  const handleHideLoginModal = () => setShowLoginModal(false);

  return (
    <div className="welcome-page-container">
      <div className="hero-container">
        {/* Show video only on non-mobile devices, unless it took too long to become playable */}
        {!isMobile && !videoTimedOut ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
            data-video="0"
            onPlaying={handleVideoReady}
            onError={() => setVideoTimedOut(true)}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          /* Show logo container on mobile, or on desktop when the video timed out */
          <div className="mobile-logo-container">
            <img
              src={logoImage}
              alt="Ferreira Lapa"
              className={`logo-image${logoLoaded ? ' logo-image--loaded' : ''}`}
              onLoad={() => setLogoLoaded(true)}
            />
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

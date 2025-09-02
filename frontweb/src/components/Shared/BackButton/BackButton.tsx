import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface BackButtonProps {
  to?: string | number; // Can be path or -1 to go back
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to = -1, className = '' }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (to === -1) {
      window.history.back();
    } else if (typeof to === 'string') {
      navigate(to);
    } else {
      navigate(to);
    }
  };

  return (
    <Button
      variant="outline-secondary"
      className={`back-button ${className}`}
      onClick={handleNavigation}
    >
      <FontAwesomeIcon icon={faArrowLeft} /> Voltar
    </Button>
  );
};

export default BackButton;

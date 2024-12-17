import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;  // Optional prop to specify custom return path
}

const BackButton: React.FC<BackButtonProps> = ({ to }) => {
  const navigate = useNavigate();

  return (
    <button 
      className="btn btn-primary me-3" 
      onClick={() => to ? navigate(to) : navigate(-1)}
    >
      Voltar
    </button>
  );
};

export default BackButton;
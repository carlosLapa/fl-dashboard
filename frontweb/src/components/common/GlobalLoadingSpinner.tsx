import React from 'react';
import { Spinner } from 'react-bootstrap';

const GlobalLoadingSpinner: React.FC = () => {
  return (
    <div className="text-center p-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">A carregar página...</span>
      </Spinner>
      <p className="mt-2">A carregar página...</p>
    </div>
  );
};

export default GlobalLoadingSpinner;

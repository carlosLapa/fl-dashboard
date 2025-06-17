import React from 'react';
import { Spinner } from 'react-bootstrap';

const ProjetoLoadingState: React.FC = () => {
  return (
    <div className="text-center p-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Carregando projetos...</span>
      </Spinner>
      <p className="mt-2">Carregando projetos...</p>
    </div>
  );
};

export default ProjetoLoadingState;

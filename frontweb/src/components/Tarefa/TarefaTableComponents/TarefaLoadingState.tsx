import React from 'react';
import { Spinner } from 'react-bootstrap';

const TarefaLoadingState: React.FC = () => {
  return (
    <div className="text-center p-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">A carregar tarefas...</span>
      </Spinner>
      <p className="mt-2">A carregar tarefas...</p>
    </div>
  );
};

export default TarefaLoadingState;

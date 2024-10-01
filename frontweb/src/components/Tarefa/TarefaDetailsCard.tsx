import React from 'react';
import { TarefaWithUsersAndProjetoDTO } from 'types/tarefa';
import Card from 'react-bootstrap/Card';

interface TarefaDetailsCardProps {
  tarefa: TarefaWithUsersAndProjetoDTO;
  onClose: () => void;
}

const TarefaDetailsCard: React.FC<TarefaDetailsCardProps> = ({
  tarefa,
  onClose,
}) => {
  return (
    <>
      <div className="tarefa-details-card-overlay" onClick={onClose}></div>
      <div className="tarefa-details-card">
        <Card>
          <Card.Body>
            <Card.Title>{tarefa.descricao}</Card.Title>
            <Card.Text>
              <strong>Prazo Real:</strong>{' '}
              {new Date(tarefa.prazoReal).toLocaleDateString()}
            </Card.Text>
            <Card.Text>
              <strong>Status:</strong> {tarefa.status}
            </Card.Text>
            <Card.Text>
              <strong>Projeto:</strong> {tarefa.projeto?.designacao || 'N/A'}
            </Card.Text>
            <Card.Text>
              <strong>Atribuição:</strong>{' '}
              {tarefa.users.map((user) => user.name).join(', ') || 'N/A'}
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default TarefaDetailsCard;

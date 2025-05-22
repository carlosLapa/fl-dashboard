import React from 'react';
import { TarefaWithUserAndProjetoDTO } from 'types/tarefa';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface TarefaDetailsCardProps {
  tarefa: TarefaWithUserAndProjetoDTO;
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
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Detalhes da Tarefa</h5>
            <Button variant="link" className="p-0" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>{tarefa.descricao}</Card.Title>
            <div className="mt-3">
              <p className="mb-2">
                <strong>Início:</strong> {/* Changed from "Prazo Estimado" */}
                {tarefa.prazoEstimado
                  ? new Date(tarefa.prazoEstimado).toLocaleDateString()
                  : 'Não definido'}
              </p>
              <p className="mb-2">
                <strong>Prazo:</strong> {/* Changed from "Prazo Real" */}
                {tarefa.prazoReal
                  ? new Date(tarefa.prazoReal).toLocaleDateString()
                  : 'Não definido'}
              </p>
              {/* Add working days information */}
              <p className="mb-2">
                <strong>Dias Úteis:</strong>{' '}
                {tarefa.workingDays !== undefined
                  ? `${tarefa.workingDays} dia(s)`
                  : 'Não calculado'}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {tarefa.status}
              </p>
              <p className="mb-2">
                <strong>Prioridade:</strong>{' '}
                {tarefa.prioridade || 'Não definida'}
              </p>
              <p className="mb-2">
                <strong>Projeto:</strong> {tarefa.projeto?.designacao || 'N/A'}
              </p>
              <p className="mb-2">
                <strong>Atribuição:</strong>{' '}
                {tarefa.users && tarefa.users.length > 0
                  ? tarefa.users.map((user) => user.name).join(', ')
                  : 'Não atribuída'}
              </p>
            </div>
          </Card.Body>
          <Card.Footer className="text-end">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </Card.Footer>
        </Card>
      </div>
    </>
  );
};

export default TarefaDetailsCard;

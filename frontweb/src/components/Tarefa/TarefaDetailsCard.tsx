import React from 'react';
import { TarefaWithUserAndProjetoDTO } from 'types/tarefa';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import TarefaPrioridadeBadge from './TarefaPrioridadeBadge';
import { useSubtarefas } from '../../hooks/useSubtarefas';
import { getTarefaStatusLabel } from '../../constants/tarefaStatus';

interface TarefaDetailsCardProps {
  tarefa: TarefaWithUserAndProjetoDTO;
  onClose: () => void;
}

const TarefaDetailsCard: React.FC<TarefaDetailsCardProps> = ({
  tarefa,
  onClose,
}) => {
  const { isDividida, totalPercentual } = useSubtarefas(tarefa.id);

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
                <strong>Duração (dias úteis):</strong>{' '}
                {tarefa.workingDays != null
                  ? `${tarefa.workingDays} dia(s)`
                  : 'Não calculado'}
              </p>
              <p className="mb-2">
                <strong>Estado:</strong> {getTarefaStatusLabel(tarefa.status)}
              </p>
              <p className="mb-2">
                <strong>Prioridade:</strong>{' '}
                <TarefaPrioridadeBadge prioridade={tarefa.prioridade} />
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
              {isDividida && (
                <div className="mb-2">
                  <strong>Subtarefas:</strong> {totalPercentual}% concluído
                  <ProgressBar
                    now={totalPercentual}
                    variant={
                      totalPercentual >= 100
                        ? 'success'
                        : totalPercentual >= 50
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1"
                    style={{ height: '8px' }}
                  />
                </div>
              )}
              {/* Add Externos information */}
              <p className="mb-2">
                <strong>Externos:</strong>{' '}
                {tarefa.externos && tarefa.externos.length > 0
                  ? tarefa.externos.map((externo) => externo.name).join(', ')
                  : 'Nenhum externo associado'}
              </p>
              {tarefa.links && tarefa.links.length > 0 && (
                <div className="mb-2">
                  <strong>Links partilhados:</strong>
                  <ul className="mb-0 ps-3">
                    {tarefa.links.map((link) => (
                      <li key={link.id}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.descricao || link.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

import React, { useState, useEffect } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import './SessionExpirationModal.scss';

interface SessionExpirationModalProps {
  show: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  remainingSeconds: number; // Total time user has to respond
}

const SessionExpirationModal: React.FC<SessionExpirationModalProps> = ({
  show,
  onExtendSession,
  onLogout,
  remainingSeconds,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    if (show) {
      setTimeLeft(remainingSeconds);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [show, remainingSeconds, onLogout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / remainingSeconds) * 100;

  return (
    <Modal
      show={show}
      onHide={() => {}} // Prevent closing by clicking outside
      backdrop="static"
      keyboard={false}
      centered
      className="session-expiration-modal"
    >
      <Modal.Header>
        <Modal.Title>Sessão prestes a expirar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="expiration-warning">
          <p className="warning-text">
            A sua sessão vai expirar em <strong>{formatTime(timeLeft)}</strong> devido
            a inatividade.
          </p>
          <ProgressBar
            now={progressPercentage}
            variant={progressPercentage > 50 ? 'warning' : 'danger'}
            className="expiration-progress"
          />
          <p className="help-text">
            Deseja continuar a trabalhar ou terminar a sessão?
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onLogout}>
          Terminar Sessão
        </Button>
        <Button variant="primary" onClick={onExtendSession}>
          Continuar Ligado
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionExpirationModal;

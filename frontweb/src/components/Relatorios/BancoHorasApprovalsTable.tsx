import React, { useState } from 'react';
import { Badge, Button, Form, Modal, Table } from 'react-bootstrap';
import { UserExtraHoursDTO } from 'types/userExtraHours';
import './BancoHorasApprovalsTable.scss';

interface BancoHorasApprovalsTableProps {
  entries: UserExtraHoursDTO[];
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

/**
 * ADMIN-only queue of every PENDING Banco de Horas entry across all
 * colaboradores. Mirrors BancoHorasOverviewTable's list layout, but with
 * approve/reject actions instead of a drill-down link.
 */
const BancoHorasApprovalsTable: React.FC<BancoHorasApprovalsTableProps> = ({
  entries,
  onApprove,
  onReject,
}) => {
  const [rejectTarget, setRejectTarget] = useState<UserExtraHoursDTO | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState('');

  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectTarget?.id != null) {
      onReject(rejectTarget.id, rejectReason.trim());
    }
    closeRejectModal();
  };

  return (
    <div className="banco-horas-approvals-table">
      {entries.length === 0 ? (
        <div className="text-center text-muted py-5">
          Não há lançamentos pendentes de aprovação.
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Data</th>
                <th className="text-center">Tipo</th>
                <th className="text-center">Horas</th>
                <th>Comentário</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.userName}</strong>
                  </td>
                  <td>
                    {new Date(`${entry.date}T00:00:00`).toLocaleDateString(
                      'pt-PT',
                    )}
                  </td>
                  <td className="text-center">
                    <Badge bg={entry.hours >= 0 ? 'success' : 'danger'}>
                      {entry.hours >= 0 ? 'Extra' : 'Falta'}
                    </Badge>
                  </td>
                  <td className="text-center numeric-cell">
                    {entry.hours > 0 ? '+' : ''}
                    {entry.hours}h
                  </td>
                  <td>{entry.comment || '—'}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="success"
                      className="me-2"
                      onClick={() => entry.id != null && onApprove(entry.id)}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setRejectTarget(entry)}
                    >
                      Rejeitar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={!!rejectTarget} onHide={closeRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rejeitar lançamento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rejectTarget && (
            <p className="text-muted">
              {rejectTarget.userName} —{' '}
              {new Date(`${rejectTarget.date}T00:00:00`).toLocaleDateString(
                'pt-PT',
              )}{' '}
              ({rejectTarget.hours > 0 ? '+' : ''}
              {rejectTarget.hours}h)
            </p>
          )}
          <Form.Group controlId="rejectReason">
            <Form.Label>Motivo (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              maxLength={255}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explique ao colaborador porque foi rejeitado"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRejectModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmReject}>
            Rejeitar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BancoHorasApprovalsTable;

import React from 'react';
import { Badge, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { UserExtraHoursBalanceDTO } from '../../types/userExtraHours';
import './BancoHorasOverviewTable.scss';

interface BancoHorasOverviewTableProps {
  colaboradores: UserExtraHoursBalanceDTO[];
  onViewDetail: (userId: number) => void;
}

/**
 * Manager-facing overview: one row per collaborator with a lifetime hour
 * balance, mirroring ColaboradorGlobalMetricsTable's list-then-drill-down
 * pattern.
 */
const BancoHorasOverviewTable: React.FC<BancoHorasOverviewTableProps> = ({
  colaboradores,
  onViewDetail,
}) => {
  return (
    <div className="banco-horas-overview-table">
      <h5 className="mb-4">Saldo por Colaborador</h5>

      {colaboradores.length === 0 ? (
        <div className="text-center text-muted py-5">
          Nenhum colaborador com lançamentos de horas encontrado
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th className="text-center">Saldo Acumulado</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((col) => (
                <tr key={col.userId}>
                  <td>
                    <strong>{col.userName}</strong>
                  </td>
                  <td className="text-center numeric-cell">
                    <Badge bg={col.totalHours >= 0 ? 'success' : 'danger'}>
                      {col.totalHours > 0 ? '+' : ''}
                      {col.totalHours}h
                    </Badge>
                  </td>
                  <td className="text-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`banco-horas-tooltip-${col.userId}`}>
                          Ver Banco de Horas
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faHistory}
                        role="button"
                        onClick={() => onViewDetail(col.userId)}
                        className="action-icon"
                      />
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default BancoHorasOverviewTable;

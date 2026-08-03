import React, { useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import TarefaPrioridadeBadge from '../Tarefa/TarefaPrioridadeBadge';
import UserTarefaFilterPanel from './UserTarefaFilterPanel';
import { useUserTarefaFilters } from '../../hooks/useFilterState';
import './userTarefaTable.scss';

interface UserTarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
}

const UserTarefaTable: React.FC<UserTarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, appliedFilters, isFiltered, updateFilter, applyFilters, clearFilters } =
    useUserTarefaFilters();

  const filteredTarefas = useMemo(() => {
    if (!isFiltered) return tarefas;

    const descricao = appliedFilters.descricao?.toLowerCase().trim();
    const projeto = appliedFilters.projeto?.toLowerCase().trim();

    return tarefas.filter((tarefa) => {
      if (descricao && !tarefa.descricao?.toLowerCase().includes(descricao)) {
        return false;
      }
      if (appliedFilters.status && tarefa.status !== appliedFilters.status) {
        return false;
      }
      if (
        appliedFilters.prioridade &&
        tarefa.prioridade !== appliedFilters.prioridade
      ) {
        return false;
      }
      if (
        projeto &&
        !tarefa.projeto?.designacao?.toLowerCase().includes(projeto)
      ) {
        return false;
      }
      return true;
    });
  }, [tarefas, appliedFilters, isFiltered]);

  return (
    <div className="tarefa-table-container">
      <UserTarefaFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <div className="table-responsive">
        <Table striped bordered hover className="tarefa-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="d-none d-md-table-cell">Status</th>
              <th className="d-none d-md-table-cell">Prioridade</th>
              <th className="d-none d-md-table-cell">Ínicio</th>
              <th className="d-none d-lg-table-cell">Prazo</th>
              <th className="d-none d-lg-table-cell">Dias Úteis</th>
              <th className="d-none d-lg-table-cell">Projeto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTarefas.length > 0 ? (
              filteredTarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.descricao}</td>
                  <td className="d-none d-md-table-cell">{tarefa.status}</td>
                  <td className="d-none d-md-table-cell">
                    <TarefaPrioridadeBadge prioridade={tarefa.prioridade} />
                  </td>
                  <td className="d-none d-md-table-cell">
                    {new Date(tarefa.prazoEstimado).toLocaleDateString()}
                  </td>
                  <td className="d-none d-lg-table-cell">
                    {new Date(tarefa.prazoReal).toLocaleDateString()}
                  </td>
                  <td className="d-none d-lg-table-cell">
                    {tarefa.workingDays !== undefined
                      ? `${tarefa.workingDays} dia(s)`
                      : '-'}
                  </td>
                  <td className="d-none d-lg-table-cell">
                    {tarefa.projeto.designacao}
                  </td>
                  <td>
                    <div className="action-icons">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`edit-tooltip-${tarefa.id}`}>
                            Editar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditTarefa(tarefa.id)}
                          className="action-icon edit-icon"
                          style={{ marginRight: '10px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`delete-tooltip-${tarefa.id}`}>
                            Apagar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteTarefa(tarefa.id)}
                          className="action-icon delete-icon"
                          style={{ marginLeft: '10px' }}
                        />
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  {isFiltered
                    ? 'Nenhuma tarefa corresponde aos filtros aplicados'
                    : 'Não existem tarefas para este utilizador'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserTarefaTable;

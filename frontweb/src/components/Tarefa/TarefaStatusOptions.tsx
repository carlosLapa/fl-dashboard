import React from 'react';
import { TarefaStatus } from '../../types/tarefa';
import { TAREFA_STATUS_LABELS } from '../../constants/tarefaStatus';

interface TarefaStatusOptionsProps {
  // Whether the user may mark a tarefa as DONE (Permission.MOVE_CARD_TO_DONE).
  podeConcluir: boolean;
  // Current status: a tarefa already DONE keeps the option, so the form still
  // shows its real value and can be saved.
  estadoAtual?: TarefaStatus;
}

// <option>s for a tarefa status <Form.Select>. DONE is disabled for users who
// can't approve work, mirroring the Kanban and the backend rule.
const TarefaStatusOptions: React.FC<TarefaStatusOptionsProps> = ({
  podeConcluir,
  estadoAtual,
}) => (
  <>
    {(Object.entries(TAREFA_STATUS_LABELS) as [TarefaStatus, string][]).map(
      ([value, label]) => {
        const bloqueada =
          value === 'DONE' && !podeConcluir && estadoAtual !== 'DONE';
        return (
          <option key={value} value={value} disabled={bloqueada}>
            {bloqueada ? `${label} (só gestores)` : label}
          </option>
        );
      }
    )}
  </>
);

export default TarefaStatusOptions;

import React from 'react';
import { Table } from 'react-bootstrap';
import { Tarefa, TarefaWithUsersAndProjetoDTO } from '../../types/tarefa';

interface ProjetoTarefasTableProps {
  tarefas: Tarefa[] | TarefaWithUsersAndProjetoDTO[];
}

const ProjetoTarefasTable: React.FC<ProjetoTarefasTableProps> = ({ tarefas }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Status</th>
          <th>Prioridade</th>
          <th>Prazo Estimado</th>
          <th>Prazo Real</th>
          <th>Atribuição</th>
        </tr>
      </thead>
      <tbody>
        {tarefas.map((tarefa) => (
          <tr key={tarefa.id}>
            <td>{tarefa.descricao}</td>
            <td>{tarefa.status}</td>
            <td>{tarefa.prioridade}</td>
            <td>{new Date(tarefa.prazoEstimado).toLocaleDateString()}</td>
            <td>{new Date(tarefa.prazoReal).toLocaleDateString()}</td>
            <td>{tarefa.users && tarefa.users.length > 0 ? tarefa.users.map(user => user.name).join(', ') : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ProjetoTarefasTable;

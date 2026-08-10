import React, { useCallback, useEffect, useState } from 'react';
import { Table, Card, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import TarefaPrioridadeBadge from '../Tarefa/TarefaPrioridadeBadge';
import { TarefaWithUsersDTO } from '../../types/tarefa';
import { getTarefasArquivadasByProjeto, reativarTarefa } from '../../services/tarefaService';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../permissions/rolePermissions';

interface ProjetoTarefasArquivadasTableProps {
  projetoId: number;
  onReactivated?: () => void;
}

const ProjetoTarefasArquivadasTable: React.FC<
  ProjetoTarefasArquivadasTableProps
> = ({ projetoId, onReactivated }) => {
  const { hasPermission } = usePermissions();
  const [tarefas, setTarefas] = useState<TarefaWithUsersDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const fetchArquivadas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTarefasArquivadasByProjeto(projetoId);
      setTarefas(data);
    } catch (error) {
      console.error('Erro ao carregar tarefas arquivadas:', error);
      toast.error('Erro ao carregar tarefas arquivadas');
    } finally {
      setIsLoading(false);
    }
  }, [projetoId]);

  useEffect(() => {
    fetchArquivadas();
  }, [fetchArquivadas]);

  const handleReactivate = async (tarefaId: number) => {
    try {
      await reativarTarefa(tarefaId);
      toast.success('Tarefa reativada com sucesso!');
      await fetchArquivadas();
      onReactivated?.();
    } catch (error) {
      console.error('Erro ao reativar tarefa:', error);
      toast.error('Erro ao reativar tarefa');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <Spinner animation="border" role="status" size="sm">
          <span className="visually-hidden">A Carregar...</span>
        </Spinner>
      </div>
    );
  }

  if (tarefas.length === 0) {
    return <div className="p-3">Sem tarefas arquivadas</div>;
  }

  return (
    <Card>
      <Card.Body>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Prioridade</th>
                <th>Arquivada em</th>
                <th className="d-none d-lg-table-cell">Atribuição</th>
                {hasPermission(Permission.MOVE_CARD_TO_DONE) && <th></th>}
              </tr>
            </thead>
            <tbody>
              {tarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.descricao}</td>
                  <td>
                    <TarefaPrioridadeBadge prioridade={tarefa.prioridade} />
                  </td>
                  <td>{formatDate(tarefa.arquivadaEm)}</td>
                  <td className="d-none d-lg-table-cell">
                    {tarefa.users && tarefa.users.length > 0
                      ? tarefa.users.map((user) => user.name).join(', ')
                      : 'N/A'}
                  </td>
                  {hasPermission(Permission.MOVE_CARD_TO_DONE) && (
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleReactivate(tarefa.id)}
                      >
                        Reativar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjetoTarefasArquivadasTable;

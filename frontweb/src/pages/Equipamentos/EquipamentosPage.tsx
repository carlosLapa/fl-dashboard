import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Form, Spinner, Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import EquipamentoModal from 'components/Equipamento/EquipamentoModal';
import { usePermissions } from 'hooks/usePermissions';
import { Permission } from 'permissions/rolePermissions';
import {
  createEquipamento,
  getEquipamentos,
  getRequisicoes,
  updateEquipamento,
} from 'services/equipamentoService';
import {
  Equipamento,
  EquipamentoFormData,
  RequisicaoEquipamentoDetalhe,
} from 'types/equipamento';
import 'assets/styles/layout.scss';

const formatDia = (dia: string) => format(parseISO(dia), 'dd/MM/yyyy');

/**
 * Who has which material and when, for everyone, plus the catalogue itself,
 * which only those with MANAGE_EQUIPAMENTOS can change. Requisições are edited
 * through their tarefa, so this page only lists them.
 */
const EquipamentosPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(Permission.MANAGE_EQUIPAMENTOS);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [requisicoes, setRequisicoes] = useState<
    RequisicaoEquipamentoDetalhe[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [equipamentoFiltro, setEquipamentoFiltro] = useState('');
  const [soConflitos, setSoConflitos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipamento | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [equipamentosData, requisicoesData] = await Promise.all([
        getEquipamentos(true),
        getRequisicoes(),
      ]);
      setEquipamentos(equipamentosData);
      setRequisicoes(requisicoesData);
    } catch (err) {
      console.error('Error loading equipamentos:', err);
      setError('Erro ao carregar os equipamentos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requisicoesVisiveis = useMemo(
    () =>
      requisicoes.filter(
        (requisicao) =>
          (!equipamentoFiltro ||
            requisicao.equipamentoId === Number(equipamentoFiltro)) &&
          (!soConflitos || requisicao.conflito),
      ),
    [requisicoes, equipamentoFiltro, soConflitos],
  );

  const handleSave = async (data: EquipamentoFormData) => {
    if (editing) {
      await updateEquipamento(editing.id, { ...data, ativo: editing.ativo });
    } else {
      await createEquipamento(data);
    }
    toast.success('Equipamento guardado');
    await fetchData();
  };

  const handleToggleAtivo = async (equipamento: Equipamento) => {
    try {
      await updateEquipamento(equipamento.id, {
        nome: equipamento.nome,
        descricao: equipamento.descricao ?? '',
        ativo: !equipamento.ativo,
      });
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao atualizar o equipamento',
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-shell">
        <div className="page-title-container">
          <div>
            <h2 className="page-title mb-1">Equipamentos</h2>
            <p className="text-muted mb-0">
              Material requisitado nas tarefas, a decorrer ou agendado. Para
              requisitar, abra a tarefa e use o separador "Material".
            </p>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          {isLoading ? (
            <div className="text-center" style={{ padding: '3rem' }}>
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">A carregar...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <p>{error}</p>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={fetchData}>
                  Tentar Novamente
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <h4 className="mb-3">Requisições</h4>
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <Form.Select
                  aria-label="Filtrar por equipamento"
                  style={{ maxWidth: '280px' }}
                  value={equipamentoFiltro}
                  onChange={(e) => setEquipamentoFiltro(e.target.value)}
                >
                  <option value="">Todos os equipamentos</option>
                  {equipamentos.map((equipamento) => (
                    <option key={equipamento.id} value={equipamento.id}>
                      {equipamento.nome}
                    </option>
                  ))}
                </Form.Select>
                <Form.Check
                  type="checkbox"
                  id="so-conflitos"
                  label="Só conflitos"
                  checked={soConflitos}
                  onChange={(e) => setSoConflitos(e.target.checked)}
                />
              </div>
              <Table responsive bordered hover className="mb-5">
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Período</th>
                    <th>Tarefa</th>
                    <th>Projeto</th>
                    <th>Colaboradores</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {requisicoesVisiveis.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">
                        Nenhuma requisição encontrada
                      </td>
                    </tr>
                  ) : (
                    requisicoesVisiveis.map((requisicao) => (
                      <tr
                        key={requisicao.id}
                        className={requisicao.conflito ? 'table-warning' : ''}
                      >
                        <td>
                          {requisicao.equipamentoNome}
                          {requisicao.conflito && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              Conflito
                            </Badge>
                          )}
                        </td>
                        <td>
                          {formatDia(requisicao.dataInicio)} a{' '}
                          {formatDia(requisicao.dataFim)}
                        </td>
                        <td>{requisicao.tarefaDescricao}</td>
                        <td>{requisicao.projetoDesignacao || '—'}</td>
                        <td>{requisicao.colaboradores.join(', ') || '—'}</td>
                        <td>{requisicao.observacoes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Lista de equipamentos</h4>
                {canManage && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditing(null);
                      setShowModal(true);
                    }}
                  >
                    Novo Equipamento
                  </Button>
                )}
              </div>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Estado</th>
                    {canManage && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {equipamentos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={canManage ? 4 : 3}
                        className="text-center text-muted"
                      >
                        Ainda não há equipamentos registados
                      </td>
                    </tr>
                  ) : (
                    equipamentos.map((equipamento) => (
                      <tr key={equipamento.id}>
                        <td>{equipamento.nome}</td>
                        <td>{equipamento.descricao || '—'}</td>
                        <td>
                          <Badge bg={equipamento.ativo ? 'success' : 'secondary'}>
                            {equipamento.ativo ? 'Ativo' : 'Desativado'}
                          </Badge>
                        </td>
                        {canManage && (
                          <td className="text-nowrap">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                              onClick={() => {
                                setEditing(equipamento);
                                setShowModal(true);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant={
                                equipamento.ativo
                                  ? 'outline-danger'
                                  : 'outline-success'
                              }
                              size="sm"
                              onClick={() => handleToggleAtivo(equipamento)}
                            >
                              {equipamento.ativo ? 'Desativar' : 'Reativar'}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
          )}
        </div>
      </div>
      <EquipamentoModal
        show={showModal}
        equipamento={editing}
        onHide={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default EquipamentosPage;

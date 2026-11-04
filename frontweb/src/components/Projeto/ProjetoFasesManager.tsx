import React, { useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faPencilAlt,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ProjetoFase, ProjetoFaseFormData } from 'types/projetoFase';
import { Tarefa } from 'types/tarefa';
import {
  createFase,
  deleteFase,
  formatarDataFase,
  moverFase,
  reordenarFases,
  updateFase,
} from 'services/projetoFaseService';
import ProjetoFaseModal from './ProjetoFaseModal';
import { TAREFA_STATUS_LABELS } from 'constants/tarefaStatus';

interface ProjetoFasesManagerProps {
  projetoId: number;
  prazoProjeto?: string;
  fases: ProjetoFase[];
  tarefas: Tarefa[];
  canEdit: boolean;
  onFasesChange: (fases: ProjetoFase[]) => void;
  // A deleted phase's tarefas go back to "sem fase" on the backend; the page
  // mirrors that locally instead of reloading the whole projeto.
  onFaseDeleted: (faseId: number) => void;
  // Opens a listed tarefa in the edit modal (same as the pencil in the tarefas table).
  onEditTarefa?: (tarefaId: number) => void;
}

const ProjetoFasesManager: React.FC<ProjetoFasesManagerProps> = ({
  projetoId,
  prazoProjeto,
  fases,
  tarefas,
  canEdit,
  onFasesChange,
  onFaseDeleted,
  onEditTarefa,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [faseToEdit, setFaseToEdit] = useState<ProjetoFase | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const tarefasDaFase = (faseId: number) =>
    tarefas
      .filter((tarefa) => tarefa.faseId === faseId)
      .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt'));
  const contarTarefas = (faseId: number) => tarefasDaFase(faseId).length;
  const semFase = tarefas.filter((tarefa) => !tarefa.faseId).length;

  const abrirNova = () => {
    setFaseToEdit(null);
    setShowModal(true);
  };

  const abrirEdicao = (fase: ProjetoFase) => {
    setFaseToEdit(fase);
    setShowModal(true);
  };

  const handleSave = async (data: ProjetoFaseFormData) => {
    if (faseToEdit) {
      const atualizada = await updateFase(projetoId, faseToEdit.id, data);
      onFasesChange(fases.map((f) => (f.id === atualizada.id ? atualizada : f)));
      toast.success('Fase atualizada com sucesso');
    } else {
      const criada = await createFase(projetoId, data);
      onFasesChange([...fases, criada]);
      toast.success('Fase criada com sucesso');
    }
    setShowModal(false);
    setFaseToEdit(null);
  };

  const handleDelete = async (fase: ProjetoFase) => {
    const n = contarTarefas(fase.id);
    const aviso =
      n > 0
        ? `\n\n${n === 1 ? 'A tarefa associada fica' : `As ${n} tarefas associadas ficam`} sem fase (não são apagadas).`
        : '';
    if (!window.confirm(`Apagar a fase "${fase.nome}"?${aviso}`)) {
      return;
    }
    try {
      await deleteFase(projetoId, fase.id);
      onFasesChange(fases.filter((f) => f.id !== fase.id));
      onFaseDeleted(fase.id);
      toast.success('Fase apagada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao apagar a fase');
    }
  };

  const handleMover = async (index: number, direcao: -1 | 1) => {
    const ids = moverFase(fases, index, direcao);
    if (!ids) return;
    setIsReordering(true);
    try {
      onFasesChange(await reordenarFases(projetoId, ids));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao reordenar as fases',
      );
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Fases do Projeto</h5>
        {canEdit && (
          <Button variant="primary" size="sm" onClick={abrirNova}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nova Fase
          </Button>
        )}
      </Card.Header>
      <Card.Body className={fases.length > 0 ? 'p-0' : undefined}>
        {fases.length === 0 ? (
          <div className="text-muted">
            Este projeto ainda não tem fases.
            {canEdit &&
              ' Crie fases (ex.: Design, Execução, Entrega) para organizar as tarefas e acompanhar o projeto na timeline.'}
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}>#</th>
                  <th>Fase</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Tarefas</th>
                  {canEdit && <th style={{ width: '1%' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {fases.map((fase, index) => (
                  <tr key={fase.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div>{fase.nome}</div>
                      {fase.descricao && (
                        <small className="text-muted">{fase.descricao}</small>
                      )}
                    </td>
                    <td>{formatarDataFase(fase.dataInicio)}</td>
                    <td>{formatarDataFase(fase.dataFim)}</td>
                    <td>
                      <Badge bg="secondary">{contarTarefas(fase.id)}</Badge>
                      {contarTarefas(fase.id) > 0 && (
                        <ul className="list-unstyled small mb-0 mt-1">
                          {tarefasDaFase(fase.id).map((tarefa) => (
                            <li key={tarefa.id}>
                              {onEditTarefa ? (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-start align-baseline"
                                  title="Abrir tarefa"
                                  onClick={() => onEditTarefa(tarefa.id)}
                                >
                                  {tarefa.descricao}
                                </Button>
                              ) : (
                                tarefa.descricao
                              )}{' '}
                              <span className="text-muted">
                                ({TAREFA_STATUS_LABELS[tarefa.status]})
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    {canEdit && (
                      <td className="text-nowrap">
                        <ButtonGroup size="sm" className="me-2">
                          <Button
                            variant="outline-secondary"
                            title="Subir"
                            aria-label={`Subir a fase ${fase.nome}`}
                            disabled={isReordering || index === 0}
                            onClick={() => handleMover(index, -1)}
                          >
                            <FontAwesomeIcon icon={faArrowUp} />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            title="Descer"
                            aria-label={`Descer a fase ${fase.nome}`}
                            disabled={isReordering || index === fases.length - 1}
                            onClick={() => handleMover(index, 1)}
                          >
                            <FontAwesomeIcon icon={faArrowDown} />
                          </Button>
                        </ButtonGroup>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1"
                          title="Editar"
                          aria-label={`Editar a fase ${fase.nome}`}
                          onClick={() => abrirEdicao(fase)}
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Apagar"
                          aria-label={`Apagar a fase ${fase.nome}`}
                          onClick={() => handleDelete(fase)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
            {semFase > 0 && (
              <div className="small text-muted px-3 py-2">
                {semFase === 1
                  ? '1 tarefa ainda sem fase.'
                  : `${semFase} tarefas ainda sem fase.`}{' '}
                Associe-as na edição de cada tarefa.
              </div>
            )}
          </div>
        )}
      </Card.Body>

      <ProjetoFaseModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setFaseToEdit(null);
        }}
        onSave={handleSave}
        fase={faseToEdit}
        prazoProjeto={prazoProjeto}
      />
    </Card>
  );
};

export default ProjetoFasesManager;

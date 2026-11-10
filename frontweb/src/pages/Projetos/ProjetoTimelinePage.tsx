import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Card, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getProjetoWithUsersAndTarefasAPI } from 'api/requestsApi';
import BackButton from 'components/Shared/BackButton/BackButton';
import ProjetoGantt from 'components/Projeto/Gantt/ProjetoGantt';
import TarefaModal from 'components/Tarefa/TarefaModal';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import { ProjetoFase } from 'types/projetoFase';
import {
  Tarefa,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUserAndProjetoDTO,
} from 'types/tarefa';
import { getFasesByProjeto } from 'services/projetoFaseService';
import {
  arquivarTarefa,
  getTarefasArquivadasByProjeto,
  getTarefaWithUsersAndProjeto,
  updateTarefa,
  updateTarefaStatus,
} from 'services/tarefaService';
import {
  arquivadasVisiveisPorDefeito,
  GANTT_CONFIG,
} from 'utils/ganttUtils';

// Gantt timeline of one projeto: its phases as rows, with the tarefas of each.
// Access follows the projeto itself (same rule as the details page).
const ProjetoTimelinePage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const id = Number(projetoId);

  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(null);
  const [fases, setFases] = useState<ProjetoFase[]>([]);
  const [arquivadas, setArquivadas] = useState<Tarefa[]>([]);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);
  // The toggle's default depends on the projeto, so it is set once, on the
  // first load; later reloads (after saving a tarefa) keep the user's choice.
  const toggleInicializado = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tarefaToEdit, setTarefaToEdit] = useState<TarefaWithUserAndProjetoDTO | null>(null);

  // Reloads without the full-page spinner when the page is already showing, so
  // saving a tarefa from the modal doesn't reset the scroll position.
  const carregar = useCallback(
    async (inicial = false) => {
      if (!id) return;
      if (inicial) setIsLoading(true);
      try {
        const [projetoData, fasesData] = await Promise.all([
          getProjetoWithUsersAndTarefasAPI(id),
          getFasesByProjeto(id),
        ]);
        setProjeto(projetoData);
        setFases(fasesData);
        if (!toggleInicializado.current) {
          toggleInicializado.current = true;
          setMostrarArquivadas(arquivadasVisiveisPorDefeito(projetoData));
        }
        setError(null);
      } catch (e) {
        console.error('Erro ao carregar a timeline:', e);
        setError('Erro ao carregar a timeline do projeto');
      } finally {
        if (inicial) setIsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    toggleInicializado.current = false;
  }, [id]);

  useEffect(() => {
    carregar(true);
  }, [carregar]);

  useEffect(() => {
    if (!mostrarArquivadas || !id) {
      setArquivadas([]);
      return;
    }
    getTarefasArquivadasByProjeto(id)
      .then((data) => setArquivadas((Array.isArray(data) ? data : []) as unknown as Tarefa[]))
      .catch(() => toast.error('Erro ao carregar as tarefas arquivadas'));
  }, [mostrarArquivadas, id]);

  const tarefas = useMemo(
    () => [...(projeto?.tarefas ?? []), ...arquivadas],
    [projeto, arquivadas],
  );

  const handleAbrirTarefa = async (tarefaId: number) => {
    try {
      setTarefaToEdit(await getTarefaWithUsersAndProjeto(tarefaId));
    } catch (e) {
      console.error('Erro ao carregar tarefa:', e);
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar a tarefa');
    }
  };

  const handleUpdateTarefa = async (formData: TarefaUpdateFormData) => {
    try {
      await updateTarefa(formData.id, formData);
      toast.success('Tarefa atualizada com sucesso!');
      setTarefaToEdit(null);
      await carregar();
    } catch (e) {
      console.error('Erro ao atualizar tarefa:', e);
      toast.error(
        e instanceof Error && e.message.includes('prazo') ? e.message : 'Erro ao atualizar tarefa',
      );
    }
  };

  // The modal's status dropdown saves immediately through this handler (its
  // own "Atualizar" doesn't send the status). Without it the change was lost.
  const handleTarefaStatusChange = async (tarefaId: number, newStatus: TarefaStatus) => {
    try {
      await updateTarefaStatus(tarefaId, newStatus);
      toast.success('Estado da tarefa atualizado');
      await carregar();
    } catch (e) {
      console.error('Erro ao atualizar o estado da tarefa:', e);
      toast.error(
        e instanceof Error && !axios.isAxiosError(e)
          ? e.message
          : 'Erro ao atualizar o estado da tarefa',
      );
    }
  };

  const handleArchiveTarefa = async (tarefaId: number) => {
    try {
      await arquivarTarefa(tarefaId);
      toast.success('Tarefa arquivada com sucesso!');
      setTarefaToEdit(null);
      await carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao arquivar tarefa');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-shell">
        <div className="page-title-container">
          <h2 className="page-title">Timeline do Projeto</h2>
          <div className="page-actions">
            <BackButton to={`/projetos/${projetoId}/details`} />
          </div>
        </div>

        {error || !projeto ? (
          <Alert variant="danger">{error ?? 'Projeto não encontrado'}</Alert>
        ) : (
          <Card>
            <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0">{projeto.designacao}</h5>
              <Form.Check
                type="switch"
                id="timeline-mostrar-arquivadas"
                label="Mostrar tarefas arquivadas"
                checked={mostrarArquivadas}
                onChange={(e) => setMostrarArquivadas(e.target.checked)}
              />
            </Card.Header>
            <Card.Body>
              {fases.length === 0 && (
                <Alert variant="info" className="py-2">
                  Este projeto ainda não tem fases: as tarefas aparecem todas em "Sem fase". As
                  fases criam-se em Detalhes do Projeto → Fases do Projeto.
                </Alert>
              )}
              <ProjetoGantt
                designacao={projeto.designacao}
                prazoProjeto={projeto.prazo}
                dataAdjudicacao={projeto.dataAdjudicacao}
                fases={fases}
                tarefas={tarefas}
                onAbrirTarefa={handleAbrirTarefa}
              />
              {GANTT_CONFIG.esconderOcorrenciasRecorrentes && (
                <div className="small text-muted mt-2">
                  As ocorrências das tarefas recorrentes não têm linha própria: contam no progresso
                  e no desvio da fase, e o resumo aparece na tarefa recorrente original.
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      {tarefaToEdit && (
        <TarefaModal
          show
          onHide={() => setTarefaToEdit(null)}
          onSave={(formData) => handleUpdateTarefa(formData as TarefaUpdateFormData)}
          onArchive={handleArchiveTarefa}
          onStatusChange={handleTarefaStatusChange}
          isEditing
          tarefa={tarefaToEdit}
        />
      )}
    </div>
  );
};

export default ProjetoTimelinePage;

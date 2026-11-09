import React, { useMemo, useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faChevronDown,
  faChevronRight,
  faCircle,
  faClock,
  faExclamationCircle,
  faExclamationTriangle,
  faMinusCircle,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { ProjetoFase } from 'types/projetoFase';
import { Tarefa } from 'types/tarefa';
import { TAREFA_STATUS_LABELS } from 'constants/tarefaStatus';
import TarefaDevolucoesBadge from 'components/Tarefa/TarefaDevolucoesBadge';
import {
  construirEixo,
  desvioTarefa,
  diasEstimadosTarefa,
  diasFase,
  DiasFase,
  diasTrabalhoTarefa,
  ESTADO_FASE_LABELS,
  EstadoFase,
  estadoFase,
  EixoTemporal,
  filtrarTarefasGantt,
  formatarDia,
  inicioDoDia,
  parseDia,
  Periodo,
  periodoPlaneado,
  periodoReal,
  periodoTarefa,
  posicaoDia,
  posicaoNoEixo,
  progressoFase,
  resumoDesvio,
  ResumoDesvio,
  resumoRevisao,
  ResumoRevisao,
  tempoDecorrido,
  textoDesvio,
  textoDesvioCurto,
  textoDevolucoes,
  textoDias,
} from 'utils/ganttUtils';
import './ProjetoGantt.scss';

const ESTADO_ICONES: Record<EstadoFase, IconDefinition> = {
  SEM_TAREFAS: faMinusCircle,
  NAO_INICIADA: faCircle,
  EM_CURSO: faClock,
  EM_RISCO: faExclamationTriangle,
  ATRASADA: faExclamationCircle,
  CONCLUIDA: faCheckCircle,
};

// Pixels per month of axis; the chart scrolls horizontally past the container.
const LARGURA_MES = 90;

interface ProjetoGanttProps {
  designacao: string;
  prazoProjeto?: string;
  dataAdjudicacao?: string;
  fases: ProjetoFase[];
  // Every tarefa, recurring occurrences included: they get no row of their own but
  // count in progress and deviation (see GANTT_CONFIG.esconderOcorrenciasRecorrentes).
  tarefas: Tarefa[];
  onAbrirTarefa?: (tarefaId: number) => void;
  hoje?: Date;
}

interface Grupo {
  chave: string;
  nome: string;
  descricao?: string | null;
  // Tarefas shown as rows (recurring occurrences left out).
  tarefas: Tarefa[];
  // The numbers below cover every tarefa of the group, occurrences included.
  numTarefas: number;
  dias: DiasFase;
  desvio: ResumoDesvio | null;
  revisao: ResumoRevisao | null;
  planeado: Periodo | null;
  real: Periodo | null;
  progresso: number;
  estado: EstadoFase;
}

const construirGrupo = (
  chave: string,
  nome: string,
  tarefas: Tarefa[],
  planeado: Periodo | null,
  hoje: Date,
  descricao?: string | null,
): Grupo => {
  const real = periodoReal(tarefas);
  const progresso = progressoFase(tarefas);
  return {
    chave,
    nome,
    descricao,
    numTarefas: tarefas.length,
    dias: diasFase(tarefas),
    desvio: resumoDesvio(tarefas),
    revisao: resumoRevisao(tarefas),
    tarefas: filtrarTarefasGantt(tarefas).sort(
      (a, b) =>
        (periodoTarefa(a)?.inicio.getTime() ?? Infinity) -
        (periodoTarefa(b)?.inicio.getTime() ?? Infinity),
    ),
    planeado,
    real,
    progresso,
    estado: estadoFase(planeado ?? real, progresso, tarefas.length, hoje),
  };
};

const textoPeriodo = (periodo: Periodo | null) =>
  periodo ? `${formatarDia(periodo.inicio)} – ${formatarDia(periodo.fim)}` : 'sem datas';

const Dica: React.FC<{ id: string; conteudo: React.ReactNode; children: React.ReactElement }> = ({
  id,
  conteudo,
  children,
}) => (
  <OverlayTrigger
    placement="top"
    trigger={['hover', 'focus']}
    overlay={
      <Tooltip id={id} className="text-start">
        {conteudo}
      </Tooltip>
    }
  >
    {children}
  </OverlayTrigger>
);

// Vertical month lines plus the "hoje" and projeto-deadline markers, repeated in
// every row's track so they read as continuous lines down the chart.
const Fundo: React.FC<{ eixo: EixoTemporal; hoje: Date; prazo: Date | null }> = ({
  eixo,
  hoje,
  prazo,
}) => (
  <>
    {eixo.meses.map((mes) => (
      <div
        key={mes.inicio.toISOString()}
        className="pg-gridline"
        style={{ left: posicaoDia(mes.inicio, eixo) }}
      />
    ))}
    <div className="pg-hoje" style={{ left: posicaoDia(hoje, eixo) }} />
    {prazo && prazo >= eixo.inicio && prazo <= eixo.fim && (
      <div className="pg-prazo" style={{ left: posicaoDia(prazo, eixo) }} />
    )}
  </>
);

const EstadoEtiqueta: React.FC<{ estado: EstadoFase }> = ({ estado }) => (
  <span className={`pg-estado pg-estado--${estado}`}>
    <FontAwesomeIcon icon={ESTADO_ICONES[estado]} className="pg-estado-icone" />
    {ESTADO_FASE_LABELS[estado]}
  </span>
);

const ProjetoGantt: React.FC<ProjetoGanttProps> = ({
  designacao,
  prazoProjeto,
  dataAdjudicacao,
  fases,
  tarefas,
  onAbrirTarefa,
  hoje: hojeProp,
}) => {
  const hoje = useMemo(() => inicioDoDia(hojeProp ?? new Date()), [hojeProp]);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());

  // Occurrences of each recurring template, for the summary on the template's row.
  const ocorrencias = useMemo(() => {
    const mapa = new Map<number, Tarefa[]>();
    tarefas.forEach((t) => {
      if (!t.tarefaOrigemId) return;
      mapa.set(t.tarefaOrigemId, [...(mapa.get(t.tarefaOrigemId) ?? []), t]);
    });
    return mapa;
  }, [tarefas]);

  const { global, grupos, semDatas, eixo, prazo } = useMemo(() => {
    const idsFases = new Set(fases.map((f) => f.id));
    const grupos: Grupo[] = fases.map((fase) =>
      construirGrupo(
        `fase-${fase.id}`,
        fase.nome,
        tarefas.filter((t) => t.faseId === fase.id),
        periodoPlaneado(fase),
        hoje,
        fase.descricao,
      ),
    );
    const orfas = tarefas.filter((t) => !t.faseId || !idsFases.has(t.faseId));
    if (orfas.length > 0) {
      grupos.push(construirGrupo('sem-fase', 'Sem fase', orfas, null, hoje));
    }

    const prazo = parseDia(prazoProjeto);
    const adjudicacao = parseDia(dataAdjudicacao);
    const realGlobal = periodoReal(tarefas);
    // The projeto's own period: adjudicação to prazo when known, else the tarefas' span.
    const planeadoGlobal =
      adjudicacao || prazo
        ? {
            inicio: adjudicacao ?? realGlobal?.inicio ?? prazo!,
            fim: prazo ?? realGlobal?.fim ?? adjudicacao!,
          }
        : null;
    const global = construirGrupo('global', designacao, tarefas, planeadoGlobal, hoje);

    const eixo = construirEixo(
      [
        planeadoGlobal,
        realGlobal,
        ...grupos.flatMap((g) => [g.planeado, g.real]),
      ],
      hoje,
    );

    return {
      global,
      grupos,
      semDatas: filtrarTarefasGantt(tarefas).filter((t) => !periodoTarefa(t)),
      eixo,
      prazo,
    };
  }, [fases, tarefas, prazoProjeto, dataAdjudicacao, designacao, hoje]);

  const alternar = (chave: string) =>
    setAbertos((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) {
        novo.delete(chave);
      } else {
        novo.add(chave);
      }
      return novo;
    });

  const todosAbertos = grupos.length > 0 && grupos.every((g) => abertos.has(g.chave));

  const barraGrupo = (grupo: Grupo) => {
    const periodo = grupo.planeado ?? grupo.real;
    if (!periodo) return null;
    const pos = posicaoNoEixo(periodo, eixo);
    const derivada = !grupo.planeado;
    const { dias, desvio, revisao } = grupo;
    const conteudo = (
      <>
        <strong>{grupo.nome}</strong>
        <div>Planeado: {textoPeriodo(grupo.planeado)}</div>
        <div>Real (tarefas): {textoPeriodo(grupo.real)}</div>
        <div>
          Progresso: {grupo.progresso}% · {grupo.numTarefas}{' '}
          {grupo.numTarefas === 1 ? 'tarefa' : 'tarefas'}
        </div>
        {dias.estimados > 0 && (
          <div>
            Estimado: {textoDias(dias.estimados)} · concluídos {dias.concluidos}
          </div>
        )}
        {desvio && (
          <div>
            Desvio (trabalho): {textoDesvio(desvio.total)} em {desvio.medidas}{' '}
            {desvio.medidas === 1 ? 'tarefa concluída' : 'tarefas concluídas'} · pior{' '}
            {textoDesvio(desvio.pior)}
          </div>
        )}
        {revisao && (
          <div>
            Em revisão: {textoDias(revisao.dias)}
            {revisao.devolucoes > 0 && ` · ${textoDevolucoes(revisao.devolucoes)}`}
          </div>
        )}
        {dias.semEstimativa > 0 && (
          <div className="fst-italic">
            {dias.semEstimativa} {dias.semEstimativa === 1 ? 'tarefa' : 'tarefas'} sem dias
            estimados
          </div>
        )}
        {grupo.planeado && grupo.estado !== 'CONCLUIDA' && grupo.estado !== 'SEM_TAREFAS' && (
          <div>Tempo decorrido: {Math.round(tempoDecorrido(grupo.planeado, hoje))}%</div>
        )}
        <div>Estado: {ESTADO_FASE_LABELS[grupo.estado]}</div>
        {derivada && <div className="fst-italic">Sem datas planeadas: barra derivada das tarefas</div>}
      </>
    );
    return (
      <>
        <Dica id={`dica-${grupo.chave}`} conteudo={conteudo}>
          <div
            className={`pg-bar pg-estado--${grupo.estado}${derivada ? ' pg-bar--derivada' : ''}`}
            style={pos}
            tabIndex={0}
            role="img"
            aria-label={`${grupo.nome}: ${grupo.progresso}% concluído, ${ESTADO_FASE_LABELS[grupo.estado]}${
              desvio ? `, desvio ${textoDesvio(desvio.total)}` : ''
            }`}
          >
            <div className="pg-bar-fill" style={{ width: `${grupo.progresso}%` }} />
          </div>
        </Dica>
        {grupo.numTarefas > 0 && (
          <span className="pg-pct" style={{ left: `calc(${pos.left} + ${pos.width})` }}>
            {grupo.progresso}%
            {desvio && desvio.total !== 0 && ` · ${textoDesvioCurto(desvio.total)}`}
          </span>
        )}
        {grupo.planeado && grupo.real && (
          <div className="pg-real" style={posicaoNoEixo(grupo.real, eixo)} />
        )}
      </>
    );
  };

  const posicaoFim = (periodo: Periodo) => {
    const pos = posicaoNoEixo(periodo, eixo);
    return `calc(${pos.left} + ${pos.width})`;
  };

  const linhaTarefa = (grupo: Grupo, tarefa: Tarefa) => {
    const periodo = periodoTarefa(tarefa);
    const estado = TAREFA_STATUS_LABELS[tarefa.status];
    const estimados = diasEstimadosTarefa(tarefa);
    const desvio = desvioTarefa(tarefa);
    const conclusao = parseDia(tarefa.dataConclusao);
    const entradaRevisao = parseDia(tarefa.entradaRevisao);
    const diasRevisao = tarefa.diasEmRevisao ?? 0;
    const trabalho = diasTrabalhoTarefa(tarefa);
    const repeticoes = ocorrencias.get(tarefa.id) ?? [];
    const resumoRepeticoes = resumoDesvio(repeticoes);
    const repeticoesConcluidas = repeticoes.filter((t) => t.status === 'DONE').length;
    return (
      <div className="pg-row pg-row--tarefa" key={`${grupo.chave}-${tarefa.id}`}>
        <div className="pg-label" title={tarefa.descricao}>
          <span className="pg-nome">
            {onAbrirTarefa ? (
              <button type="button" className="pg-link" onClick={() => onAbrirTarefa(tarefa.id)}>
                {tarefa.descricao}
              </button>
            ) : (
              tarefa.descricao
            )}
          </span>
          <TarefaDevolucoesBadge
            tarefaId={tarefa.id}
            devolucoes={tarefa.devolucoes}
            className="flex-shrink-0"
          />
          <span className="pg-estado">{estado}</span>
        </div>
        <div className="pg-track">
          <Fundo eixo={eixo} hoje={hoje} prazo={prazo} />
          {periodo && (
            <Dica
              id={`dica-tarefa-${grupo.chave}-${tarefa.id}`}
              conteudo={
                <>
                  <strong>{tarefa.descricao}</strong>
                  <div>{textoPeriodo(periodo)}</div>
                  <div>Estado: {estado}</div>
                  {estimados != null && <div>Estimado: {textoDias(estimados)}</div>}
                  {conclusao && <div>Concluída a {formatarDia(conclusao)}</div>}
                  {tarefa.diasReais != null && (
                    <div>
                      Real: {textoDias(tarefa.diasReais)}
                      {diasRevisao > 0 &&
                        trabalho != null &&
                        ` = ${trabalho} de trabalho + ${diasRevisao} em revisão`}
                    </div>
                  )}
                  {tarefa.diasReais == null && diasRevisao > 0 && (
                    <div>Em revisão até agora: {textoDias(diasRevisao)}</div>
                  )}
                  {entradaRevisao && <div>Em revisão desde {formatarDia(entradaRevisao)}</div>}
                  {desvio != null && <div>Desvio (trabalho): {textoDesvio(desvio)}</div>}
                  {(tarefa.devolucoes ?? 0) > 0 && (
                    <div>
                      Devolvida {tarefa.devolucoes} {tarefa.devolucoes === 1 ? 'vez' : 'vezes'}
                    </div>
                  )}
                  {repeticoes.length > 0 && (
                    <div>
                      {repeticoesConcluidas}{' '}
                      {repeticoesConcluidas === 1 ? 'ocorrência concluída' : 'ocorrências concluídas'}
                      {repeticoes.length > repeticoesConcluidas && ` de ${repeticoes.length}`}
                      {resumoRepeticoes &&
                        ` · desvio médio ${textoDesvio(resumoRepeticoes.medio)} · pior ${textoDesvio(
                          resumoRepeticoes.pior,
                        )}`}
                    </div>
                  )}
                  {tarefa.arquivadaEm && <div className="fst-italic">Arquivada</div>}
                </>
              }
            >
              <div
                className={`pg-bar pg-bar--tarefa pg-tarefa--${tarefa.status}`}
                style={posicaoNoEixo(periodo, eixo)}
                tabIndex={0}
                role="img"
                aria-label={`${tarefa.descricao}: ${textoPeriodo(periodo)}, ${estado}${
                  desvio != null ? `, desvio ${textoDesvio(desvio)}` : ''
                }`}
              />
            </Dica>
          )}
          {periodo && desvio != null && desvio !== 0 && (
            <span className="pg-pct pg-pct--tarefa" style={{ left: posicaoFim(periodo) }}>
              {textoDesvioCurto(desvio)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="projeto-gantt">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div className="pg-legenda" aria-label="Legenda">
          {(['NAO_INICIADA', 'EM_CURSO', 'EM_RISCO', 'ATRASADA', 'CONCLUIDA'] as EstadoFase[]).map(
            (estado) => (
              <span key={estado} className={`pg-legenda-item pg-estado--${estado}`}>
                <span className="pg-amostra" />
                <FontAwesomeIcon icon={ESTADO_ICONES[estado]} style={{ color: 'var(--pg-cor)' }} />
                {ESTADO_FASE_LABELS[estado]}
              </span>
            ),
          )}
          <span className="pg-legenda-item">
            <span className="pg-amostra pg-amostra--real" /> Período real das tarefas
          </span>
          <span className="pg-legenda-item pg-estado--EM_CURSO">
            <span className="pg-amostra pg-amostra--derivada" /> Fase sem datas planeadas
          </span>
          <span className="pg-legenda-item">
            <span className="pg-amostra pg-amostra--hoje" /> Hoje
          </span>
          {prazo && (
            <span className="pg-legenda-item">
              <span className="pg-amostra pg-amostra--prazo" /> Prazo do projeto
            </span>
          )}
        </div>
        {grupos.length > 0 && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              setAbertos(todosAbertos ? new Set() : new Set(grupos.map((g) => g.chave)))
            }
          >
            {todosAbertos ? 'Recolher tarefas' : 'Mostrar tarefas'}
          </Button>
        )}
      </div>

      <div className="pg-scroll">
        <div
          style={{
            minWidth: `calc(var(--pg-label-width) + ${eixo.meses.length * LARGURA_MES}px)`,
          }}
        >
          <div className="pg-row pg-row--cabecalho">
            <div className="pg-label">Fase</div>
            <div className="pg-track">
              {eixo.meses.map((mes) => (
                <React.Fragment key={mes.inicio.toISOString()}>
                  <div className="pg-gridline" style={{ left: posicaoDia(mes.inicio, eixo) }} />
                  <span className="pg-mes" style={{ left: posicaoDia(mes.inicio, eixo) }}>
                    {mes.rotulo}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="pg-row pg-row--global">
            <div className="pg-label">
              <span className="pg-nome fw-semibold" title={global.nome}>
                Projeto (global)
              </span>
              <EstadoEtiqueta estado={global.estado} />
            </div>
            <div className="pg-track">
              <Fundo eixo={eixo} hoje={hoje} prazo={prazo} />
              {barraGrupo(global)}
            </div>
          </div>

          {grupos.map((grupo) => {
            const aberto = abertos.has(grupo.chave);
            return (
              <React.Fragment key={grupo.chave}>
                <div className="pg-row">
                  <div className="pg-label">
                    <button
                      type="button"
                      className="pg-toggle"
                      onClick={() => alternar(grupo.chave)}
                      disabled={grupo.tarefas.length === 0}
                      aria-expanded={aberto}
                      aria-label={`${aberto ? 'Esconder' : 'Mostrar'} as tarefas de ${grupo.nome}`}
                    >
                      <FontAwesomeIcon icon={aberto ? faChevronDown : faChevronRight} />
                    </button>
                    <span
                      className={`pg-nome${grupo.chave === 'sem-fase' ? ' fst-italic' : ''}`}
                      title={grupo.descricao ? `${grupo.nome} — ${grupo.descricao}` : grupo.nome}
                    >
                      {grupo.nome}
                    </span>
                    <EstadoEtiqueta estado={grupo.estado} />
                  </div>
                  <div className="pg-track">
                    <Fundo eixo={eixo} hoje={hoje} prazo={prazo} />
                    {barraGrupo(grupo)}
                  </div>
                </div>
                {aberto && grupo.tarefas.map((tarefa) => linhaTarefa(grupo, tarefa))}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {semDatas.length > 0 && (
        <div className="pg-sem-datas">
          <strong>Sem datas, não aparecem na timeline:</strong>{' '}
          {semDatas.map((t, i) => (
            <React.Fragment key={t.id}>
              {i > 0 && ', '}
              {onAbrirTarefa ? (
                <button type="button" className="pg-link" onClick={() => onAbrirTarefa(t.id)}>
                  {t.descricao}
                </button>
              ) : (
                t.descricao
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjetoGantt;

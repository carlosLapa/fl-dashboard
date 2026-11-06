import {
  arquivadasVisiveisPorDefeito,
  diasFase,
  construirEixo,
  estadoFase,
  filtrarTarefasGantt,
  parseDia,
  periodoReal,
  periodoTarefa,
  posicaoNoEixo,
  progressoFase,
  tempoDecorrido,
} from './ganttUtils';
import { Tarefa, TarefaStatus } from 'types/tarefa';

const tarefa = (over: Partial<Tarefa>): Tarefa =>
  ({
    id: 1,
    descricao: 't',
    prioridade: 'MEDIA',
    prazoEstimado: '',
    prazoReal: '',
    status: 'TODO' as TarefaStatus,
    projeto: { id: 1, designacao: 'p' },
    users: [],
    ...over,
  }) as Tarefa;

const d = (s: string) => parseDia(s) as Date;

describe('parseDia', () => {
  it('reads the calendar day of a LocalDate or an ISO timestamp as local midnight', () => {
    expect(parseDia('2027-01-31')?.getDate()).toBe(31);
    expect(parseDia('2027-01-31T00:00:00.000+00:00')?.getDate()).toBe(31);
    expect(parseDia('')).toBeNull();
    expect(parseDia(null)).toBeNull();
  });
});

describe('periodoTarefa / periodoReal', () => {
  it('treats a tarefa with a single date as one day and ignores tarefas without dates', () => {
    expect(periodoTarefa(tarefa({ prazoReal: '2027-02-01' }))).toEqual({
      inicio: d('2027-02-01'),
      fim: d('2027-02-01'),
    });
    expect(periodoTarefa(tarefa({}))).toBeNull();
  });

  it('spans from the earliest start to the latest end', () => {
    const periodo = periodoReal([
      tarefa({ prazoEstimado: '2027-01-10', prazoReal: '2027-01-20' }),
      tarefa({ prazoEstimado: '2027-01-05', prazoReal: '2027-01-12' }),
      tarefa({}),
    ]);
    expect(periodo).toEqual({ inicio: d('2027-01-05'), fim: d('2027-01-20') });
  });
});

describe('progressoFase', () => {
  const curta = tarefa({ status: 'DONE', workingDays: 1 });
  const longa = tarefa({ status: 'IN_PROGRESS', workingDays: 9 });

  it('weights by working days when ponderado', () => {
    expect(progressoFase([curta, longa], true)).toBe(10);
  });

  it('counts tarefas when not ponderado', () => {
    expect(progressoFase([curta, longa], false)).toBe(50);
  });

  it('gives a tarefa without workingDays a weight of 1', () => {
    expect(progressoFase([tarefa({ status: 'DONE' }), tarefa({})], true)).toBe(50);
  });

  it('is 0 with no tarefas', () => {
    expect(progressoFase([])).toBe(0);
  });
});

describe('estadoFase', () => {
  const periodo = { inicio: d('2027-01-01'), fim: d('2027-01-10') };

  it('handles the terminal and empty states first', () => {
    expect(estadoFase(periodo, 0, 0, d('2027-01-05'))).toBe('SEM_TAREFAS');
    expect(estadoFase(periodo, 100, 2, d('2027-03-01'))).toBe('CONCLUIDA');
  });

  it('is not started before the period and late after it', () => {
    expect(estadoFase(periodo, 0, 2, d('2026-12-31'))).toBe('NAO_INICIADA');
    expect(estadoFase(periodo, 90, 2, d('2027-01-11'))).toBe('ATRASADA');
  });

  it('flags risk when elapsed time runs ahead of progress by more than the threshold', () => {
    // 2027-01-07: 7 of 10 days elapsed = 70%.
    expect(estadoFase(periodo, 30, 2, d('2027-01-07'), 20)).toBe('EM_RISCO');
    expect(estadoFase(periodo, 50, 2, d('2027-01-07'), 20)).toBe('EM_CURSO');
  });

  it('uses progress alone when there is no period at all', () => {
    expect(estadoFase(null, 0, 1, d('2027-01-07'))).toBe('NAO_INICIADA');
    expect(estadoFase(null, 40, 1, d('2027-01-07'))).toBe('EM_CURSO');
  });
});

describe('tempoDecorrido', () => {
  it('counts both ends and clamps to 0-100', () => {
    const periodo = { inicio: d('2027-01-01'), fim: d('2027-01-10') };
    expect(tempoDecorrido(periodo, d('2027-01-01'))).toBe(10);
    expect(tempoDecorrido(periodo, d('2026-12-01'))).toBe(0);
    expect(tempoDecorrido(periodo, d('2027-02-01'))).toBe(100);
  });
});

describe('filtrarTarefasGantt', () => {
  it('drops generated recurring occurrences but keeps the template', () => {
    const modelo = tarefa({ id: 1, recorrente: true });
    const ocorrencia = tarefa({ id: 2, tarefaOrigemId: 1 });
    expect(filtrarTarefasGantt([modelo, ocorrencia], true)).toEqual([modelo]);
    expect(filtrarTarefasGantt([modelo, ocorrencia], false)).toHaveLength(2);
  });
});

describe('construirEixo / posicaoNoEixo', () => {
  it('snaps to whole months and always includes today', () => {
    const eixo = construirEixo(
      [{ inicio: d('2027-01-15'), fim: d('2027-02-10') }],
      d('2027-03-05'),
    );
    expect(eixo.inicio).toEqual(d('2027-01-01'));
    expect(eixo.fim).toEqual(d('2027-03-31'));
    expect(eixo.meses.map((m) => m.rotulo)).toEqual(['Jan 2027', 'Fev 2027', 'Mar 2027']);
    expect(eixo.totalDias).toBe(31 + 28 + 31);
  });

  it('positions a period proportionally', () => {
    const eixo = construirEixo([{ inicio: d('2027-01-01'), fim: d('2027-01-31') }], d('2027-01-10'));
    expect(posicaoNoEixo({ inicio: d('2027-01-01'), fim: d('2027-01-31') }, eixo)).toEqual({
      left: '0%',
      width: '100%',
    });
  });
});

describe('diasFase', () => {
  it('sums estimated and done working days, counting tarefas without an estimate apart', () => {
    expect(
      diasFase([
        tarefa({ workingDays: 2, status: 'DONE' }),
        tarefa({ workingDays: 5, status: 'IN_PROGRESS' }),
        tarefa({ workingDays: undefined }),
      ]),
    ).toEqual({ estimados: 7, concluidos: 2, semEstimativa: 1 });
  });
});

describe('arquivadasVisiveisPorDefeito', () => {
  it('is on only for a projeto that has ended', () => {
    expect(arquivadasVisiveisPorDefeito({ status: 'CONCLUIDO' })).toBe(true);
    expect(arquivadasVisiveisPorDefeito({ status: 'ATIVO', arquivadaEm: '2026-11-01T10:00:00' })).toBe(true);
    expect(arquivadasVisiveisPorDefeito({ status: 'EM_PROGRESSO', arquivadaEm: null })).toBe(false);
  });
});

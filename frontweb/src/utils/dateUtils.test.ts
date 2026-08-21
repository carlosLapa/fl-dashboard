import { addDays, format } from 'date-fns';
import {
  getDeadlineStatus,
  getTaskOverdueStatus,
  findOrphanedTarefas,
} from './dateUtils';
import { Tarefa } from '../types/tarefa';

const iso = (offsetDays: number) => format(addDays(new Date(), offsetDays), 'yyyy-MM-dd');

const buildTarefa = (
  overrides: Partial<Pick<Tarefa, 'id' | 'prazoEstimado' | 'prazoReal'>>
): Tarefa => ({
  id: overrides.id ?? 1,
  descricao: 'Tarefa de teste',
  prioridade: 'MEDIA',
  prazoEstimado: overrides.prazoEstimado ?? iso(0),
  prazoReal: overrides.prazoReal ?? iso(1),
  status: 'TODO',
  projeto: { id: 1, designacao: 'Projeto de teste' },
  users: [],
});

describe('getDeadlineStatus', () => {
  it('does not flag a task as approaching just because its deadline matches the project deadline, when that deadline is still far away', () => {
    // Task started long ago, due the same day as the project, but today is
    // 41 days out from both — nothing is actually imminent yet.
    const status = getDeadlineStatus(iso(41), iso(41));
    expect(status.isApproaching).toBe(false);
  });

  it('flags a task as approaching once its own deadline is imminent and close to the project deadline', () => {
    const status = getDeadlineStatus(iso(2), iso(2));
    expect(status.isApproaching).toBe(true);
    expect(status.daysRemaining).toBe(0);
  });

  it('does not flag a task as approaching if its own deadline is imminent but far from the project deadline', () => {
    const status = getDeadlineStatus(iso(2), iso(30));
    expect(status.isApproaching).toBe(false);
  });

  it('still reports isOverdue when the task deadline is after the project deadline, regardless of today', () => {
    const status = getDeadlineStatus(iso(41), iso(35));
    expect(status.isOverdue).toBe(true);
  });

  it('returns no warning when either deadline is missing', () => {
    expect(getDeadlineStatus(undefined, iso(2)).isApproaching).toBe(false);
    expect(getDeadlineStatus(iso(2), undefined).isApproaching).toBe(false);
  });
});

describe('getTaskOverdueStatus', () => {
  it('flags a task whose deadline has already passed', () => {
    const status = getTaskOverdueStatus(iso(-3), 'TODO');
    expect(status.isPastDue).toBe(true);
    expect(status.daysOverdue).toBe(3);
  });

  it('does not flag a DONE task even if its deadline has passed', () => {
    const status = getTaskOverdueStatus(iso(-3), 'DONE');
    expect(status.isPastDue).toBe(false);
  });

  it('does not flag a task whose deadline is today or in the future', () => {
    expect(getTaskOverdueStatus(iso(0), 'TODO').isPastDue).toBe(false);
    expect(getTaskOverdueStatus(iso(1), 'TODO').isPastDue).toBe(false);
  });
});

describe('findOrphanedTarefas', () => {
  it('flags a task whose prazoReal now falls after the shortened project prazo', () => {
    const tarefas = [
      buildTarefa({ id: 1, prazoEstimado: iso(20), prazoReal: iso(25) }),
    ];
    const orphaned = findOrphanedTarefas(tarefas, iso(10));
    expect(orphaned).toHaveLength(1);
    expect(orphaned[0].id).toBe(1);
  });

  it('flags a task whose prazoEstimado (start date) alone falls after the new prazo', () => {
    const tarefas = [
      buildTarefa({ id: 1, prazoEstimado: iso(15), prazoReal: iso(5) }),
    ];
    const orphaned = findOrphanedTarefas(tarefas, iso(10));
    expect(orphaned).toHaveLength(1);
  });

  it('does not flag a task whose dates still fall within the new prazo', () => {
    const tarefas = [
      buildTarefa({ id: 1, prazoEstimado: iso(1), prazoReal: iso(5) }),
    ];
    expect(findOrphanedTarefas(tarefas, iso(10))).toHaveLength(0);
  });

  it('does not flag a task whose prazoReal equals the new prazo exactly', () => {
    const tarefas = [
      buildTarefa({ id: 1, prazoEstimado: iso(1), prazoReal: iso(10) }),
    ];
    expect(findOrphanedTarefas(tarefas, iso(10))).toHaveLength(0);
  });

  it('returns an empty array when the new prazo is invalid', () => {
    const tarefas = [buildTarefa({ id: 1 })];
    expect(findOrphanedTarefas(tarefas, 'not-a-date')).toEqual([]);
  });

  it('only returns the tasks that are actually orphaned, out of several', () => {
    const tarefas = [
      buildTarefa({ id: 1, prazoEstimado: iso(1), prazoReal: iso(5) }),
      buildTarefa({ id: 2, prazoEstimado: iso(15), prazoReal: iso(20) }),
    ];
    const orphaned = findOrphanedTarefas(tarefas, iso(10));
    expect(orphaned.map((t) => t.id)).toEqual([2]);
  });
});

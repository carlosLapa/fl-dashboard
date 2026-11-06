import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjetoGantt from './ProjetoGantt';
import { ProjetoFase } from 'types/projetoFase';
import { Tarefa, TarefaStatus } from 'types/tarefa';

const tarefa = (over: Partial<Tarefa>): Tarefa =>
  ({
    id: 1,
    descricao: 'tarefa',
    prioridade: 'MEDIA',
    prazoEstimado: '',
    prazoReal: '',
    status: 'TODO' as TarefaStatus,
    projeto: { id: 1, designacao: 'p' },
    users: [],
    ...over,
  }) as Tarefa;

const fases: ProjetoFase[] = [
  { id: 1, projetoId: 1, nome: 'Design Freeze', dataInicio: '2027-01-01', dataFim: '2027-01-10', ordem: 0 },
  { id: 2, projetoId: 1, nome: 'Instalação', ordem: 1 },
];

const tarefas: Tarefa[] = [
  tarefa({ id: 10, descricao: 'Desenhos', faseId: 1, status: 'DONE', prazoEstimado: '2027-01-01', prazoReal: '2027-01-03' }),
  tarefa({ id: 11, descricao: 'Revisão', faseId: 1, prazoEstimado: '2027-01-04', prazoReal: '2027-01-10' }),
  tarefa({ id: 12, descricao: 'Montagem', faseId: 2, prazoEstimado: '2027-02-01', prazoReal: '2027-02-05' }),
  tarefa({ id: 13, descricao: 'Solta', prazoEstimado: '2027-01-05', prazoReal: '2027-01-06' }),
  tarefa({ id: 14, descricao: 'Sem datas', faseId: 2 }),
];

const renderGantt = (onAbrirTarefa?: (id: number) => void) =>
  render(
    <ProjetoGantt
      designacao="Projeto X"
      prazoProjeto="2027-03-31"
      fases={fases}
      tarefas={tarefas}
      onAbrirTarefa={onAbrirTarefa}
      hoje={new Date(2027, 0, 8)}
    />,
  );

describe('ProjetoGantt', () => {
  it('renders one row per phase plus the "Sem fase" group and the month axis', () => {
    renderGantt();
    expect(screen.getByText('Design Freeze')).toBeInTheDocument();
    expect(screen.getByText('Instalação')).toBeInTheDocument();
    expect(screen.getByText('Sem fase')).toBeInTheDocument();
    expect(screen.getByText('Jan 2027')).toBeInTheDocument();
    expect(screen.getByText('Mar 2027')).toBeInTheDocument();
  });

  it('labels each phase state with text, not colour alone', () => {
    renderGantt();
    // Design Freeze on 08/01: 80% of its 10 days elapsed, 50% done (1 of 2 tarefas,
    // both without workingDays so weight 1) -> 30 points behind > 20-point threshold.
    expect(
      screen.getByRole('img', { name: /Design Freeze: 50% concluído, Em risco/ }),
    ).toBeInTheDocument();
  });

  it('lists tarefas without dates separately', () => {
    renderGantt();
    expect(screen.getByText(/Sem datas, não aparecem na timeline/)).toBeInTheDocument();
  });

  it('expands a phase to show its tarefas and opens one on click', () => {
    const onAbrir = jest.fn();
    renderGantt(onAbrir);
    expect(screen.queryByText('Desenhos')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Mostrar as tarefas de Design Freeze'));
    fireEvent.click(screen.getByText('Desenhos'));
    expect(onAbrir).toHaveBeenCalledWith(10);
  });
});

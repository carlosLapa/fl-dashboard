import { formatarDataFase, moverFase, validarFase } from './projetoFaseService';
import { ProjetoFase } from 'types/projetoFase';

const fase = (id: number, ordem: number): ProjetoFase => ({
  id,
  projetoId: 1,
  nome: `Fase ${id}`,
  ordem,
});

describe('moverFase', () => {
  const fases = [fase(10, 0), fase(20, 1), fase(30, 2)];

  it('swaps a phase with the one above', () => {
    expect(moverFase(fases, 1, -1)).toEqual([20, 10, 30]);
  });

  it('swaps a phase with the one below', () => {
    expect(moverFase(fases, 1, 1)).toEqual([10, 30, 20]);
  });

  it('returns null when the move would leave the list', () => {
    expect(moverFase(fases, 0, -1)).toBeNull();
    expect(moverFase(fases, 2, 1)).toBeNull();
  });

  it('does not mutate the original list', () => {
    moverFase(fases, 0, 1);
    expect(fases.map((f) => f.id)).toEqual([10, 20, 30]);
  });
});

describe('validarFase', () => {
  it('requires a name', () => {
    expect(validarFase({ nome: '   ' })).toMatch(/nome/);
  });

  it('rejects an end date before the start date', () => {
    expect(
      validarFase({ nome: 'X', dataInicio: '2027-02-01', dataFim: '2027-01-31' }),
    ).toMatch(/anterior/);
  });

  it('accepts a phase without dates or with a single-day period', () => {
    expect(validarFase({ nome: 'X' })).toBeNull();
    expect(
      validarFase({ nome: 'X', dataInicio: '2027-01-31', dataFim: '2027-01-31' }),
    ).toBeNull();
  });
});

describe('formatarDataFase', () => {
  it('formats yyyy-MM-dd as dd/MM/yyyy without a timezone shift', () => {
    expect(formatarDataFase('2027-01-01')).toBe('01/01/2027');
  });

  it('shows a dash for a missing date', () => {
    expect(formatarDataFase(null)).toBe('—');
    expect(formatarDataFase(undefined)).toBe('—');
  });
});

// A phase of a projeto, shown as one row of its timeline. Dates are plain
// 'yyyy-MM-dd' strings (backend LocalDate), both optional and inclusive.
export interface ProjetoFase {
  id: number;
  projetoId: number;
  nome: string;
  descricao?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  ordem: number;
}

export interface ProjetoFaseFormData {
  nome: string;
  descricao?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
}

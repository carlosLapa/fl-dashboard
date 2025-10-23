import { Projeto } from './projeto';
import { Tarefa } from './tarefa';

// Enum for EspecialidadesExterno
export type EspecialidadesExterno =
  | 'ACUSTICA'
  | 'ARQUEOLOGIA'
  | 'ARQUITETURA'
  | 'AVAC'
  | 'ESTABILIDADE'
  | 'ELETRICA'
  | 'ITED'
  | 'REDES_AGUAS'
  | 'REDES_ESGOTOS'
  | 'REDES_PLUVIAIS'
  | 'SEGURANCA_CONTRA_INCENDIOS'
  | 'TERMICA'
  | 'INSPECOES'
  | 'ARQUITETURA_PAISAGISTICA';

// Enum for FaseProjeto
export type FaseProjeto =
  | 'LICENCIAMENTO'
  | 'EXECUCAO'
  | 'COMUNICACAO_PREVIA'
  | 'ASSISTENCIA_TECNICA'
  | 'PROGRAMA_BASE'
  | 'ESTUDO_PREVIO'
  | 'PEDIDO_INFORMACAO_PREVIO';

// Base Externo type
export interface Externo {
  id: number;
  name: string;
  email: string;
  telemovel: string;
  preco: number;
  faseProjeto: FaseProjeto;
  especialidades: EspecialidadesExterno[];
  deletedAt?: string; // Optional since it might be null
}

// DTO for basic Externo data
export interface ExternoDTO {
  id: number;
  name: string;
  email: string;
  telemovel: string;
  preco: number;
  faseProjeto: FaseProjeto;
  especialidades: EspecialidadesExterno[];
}

// DTO for inserting a new Externo
export interface ExternoInsertDTO {
  name: string;
  email: string;
  telemovel: string;
  preco: number;
  faseProjeto: FaseProjeto;
  especialidades: EspecialidadesExterno[];
}

// DTO for updating an existing Externo
export interface ExternoUpdateDTO {
  id: number; 
  name: string;
  email: string;
  telemovel: string;
  preco: number;
  faseProjeto: FaseProjeto;
  especialidades: EspecialidadesExterno[];
}

// DTO for Externo with related Projetos
export interface ExternoWithProjetosDTO extends ExternoDTO {
  projetos: Projeto[];
}

// DTO for Externo with related Tarefas
export interface ExternoWithTarefasDTO extends ExternoDTO {
  tarefas: Tarefa[];
}

// Interface for paginated Externos response
export interface PaginatedExternos {
  content: ExternoDTO[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

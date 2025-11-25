import { Projeto, ProjetoMinDTO } from './projeto';

// Base Cliente type
export interface Cliente {
  id: number;
  name: string;
  morada: string;
  nif: string;
  numero: number;

  // Keep old fields for backward compatibility
  contacto?: string;
  responsavel?: string;

  // New collection fields
  contactos: string[];
  responsaveis: string[];
  emails: string[];

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// DTO for basic Cliente data
export interface ClienteDTO {
  id: number;
  name: string;
  morada: string;
  nif: string;
  numero: number;

  // Keep old fields for backward compatibility
  contacto?: string;
  responsavel?: string;

  // New collection fields
  contactos: string[];
  responsaveis: string[];
  emails: string[];

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// DTO for inserting a new Cliente
export interface ClienteInsertDTO {
  name: string;
  morada: string;
  nif: string;
  numero: number;

  // Keep old fields for backward compatibility
  contacto?: string;
  responsavel?: string;

  // New collection fields
  contactos: string[];
  responsaveis: string[];
  emails: string[];
}

// DTO for updating an existing Cliente
export interface ClienteUpdateDTO {
  name: string;
  morada: string;
  nif: string;
  numero: number;

  // Keep old fields for backward compatibility
  contacto?: string;
  responsavel?: string;

  // New collection fields
  contactos: string[];
  responsaveis: string[];
  emails: string[];
}

// DTO for Cliente with related Projetos
export interface ClienteWithProjetosDTO extends ClienteDTO {
  projetos: ProjetoMinDTO[];
}

// DTO for Cliente with related Projetos including Users
export interface ClienteWithProjetosAndUsersDTO extends ClienteDTO {
  projetos: Projeto[]; // This includes the full Projeto objects with users
}

// Interface for paginated Clientes response
export interface PaginatedClientes {
  content: ClienteDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

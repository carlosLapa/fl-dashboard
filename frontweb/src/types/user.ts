export type User = {
  id: number;
  name: string;
  funcao: string;
  cargo: string;
  email: string;
  password: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
};

export type UserDTO = {
  id: number | undefined;
  name: string;
  funcao: string; 
  cargo: string;
  email: string;
  password: string;
  profileImage: string;
  projetos: any[]; // Replaced ProjetoDTO with any[] since ProjetoDTO is not defined
};

export interface PaginatedUsers {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

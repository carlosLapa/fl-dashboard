export type Role = {
  id: number;
  authority: string; // "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_EMPLOYEE"
  role_type: string; // "ADMIN", "MANAGER", "EMPLOYEE"
  name: string;
};

export type User = {
  id: number;
  name: string;
  funcao: string;
  cargo: string;
  email: string;
  password: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
  roles?: Role[];
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
  roles?: Role[];
};

export interface PaginatedUsers {
  content: User[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

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
  // Only ever meaningful as an outbound value (setting/changing a password on create).
  // The API no longer returns the password hash on any GET, so this is always empty on read.
  password?: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
  ativo: boolean;
  roles?: Role[];
};

export type UserDTO = {
  id: number | undefined;
  name: string;
  funcao: string;
  cargo: string;
  email: string;
  // See User.password above — outbound-only, never populated by a GET response.
  password?: string;
  profileImage: string;
  ativo: boolean;
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

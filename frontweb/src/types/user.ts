export type User = {
  id: number;
  username: string;
  funcao: string;
  cargo: string;
  email: string;
  password: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
};

export type UserDTO = {
  id: number | undefined;
  username: string;
  funcao: string; 
  cargo: string;
  email: string;
  password: string;
  profileImage: string;
  projetos: any[]; // Replaced ProjetoDTO with any[] since ProjetoDTO is not defined
};

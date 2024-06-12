export type User = {
  id: number;
  username: string;
  funcao: string;
  cargo: string;
  email: string;
  password: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
};
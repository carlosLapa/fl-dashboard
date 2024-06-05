export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImage: string; // ou Blob, se aceitarmos ficheiros maiores
};
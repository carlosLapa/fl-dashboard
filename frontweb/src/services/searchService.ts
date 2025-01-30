import axios from 'axios';

export const searchTarefas = async (query: string) => {
  const response = await axios.get(`/tarefas/search?query=${query}`);
  return response.data;
};

export const searchProjetos = async (query: string) => {
  const response = await axios.get(`/projetos/search?query=${query}`);
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await axios.get(`/users/search?query=${query}`);
  return response.data;
};

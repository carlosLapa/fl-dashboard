import axios from '../api/apiConfig';

export const searchTarefas = async (query: string) => {
  const response = await axios.get('/tarefas/search', { params: { query } });
  return response.data;
};

export const searchProjetos = async (query: string) => {
  const response = await axios.get('/projetos/search', { params: { query } });
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await axios.get('/users/search', { params: { query } });
  return response.data;
};

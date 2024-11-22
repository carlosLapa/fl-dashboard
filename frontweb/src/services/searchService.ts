import axios from 'axios';
import { BASE_URL } from '../util/requests';

export const searchTarefas = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/tarefas/search?query=${query}`);
  return response.data;
};

export const searchProjetos = async (query: string) => {
  const response = await axios.get(
    `${BASE_URL}/projetos/search?query=${query}`
  );
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/users/search?query=${query}`);
  return response.data;
};

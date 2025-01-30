import axios from 'axios';

export const searchTarefas = async (query: string) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/tarefas/search?query=${query}`
  );
  return response.data;
};

export const searchProjetos = async (query: string) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/projetos/search?query=${query}`
  );
  return response.data;
};

export const searchUsers = async (query: string) => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/users/search?query=${query}`
  );
  return response.data;
};

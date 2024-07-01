// api/projectApi.ts
import axios from 'axios';
import { BASE_URL } from '../util/requests';
import { ProjetoFormData } from 'types/projeto';

/**
 * generic fetchFromAPI function that takes an endpoint parameter and makes the API call
 * to the specified endpoint.
 *
 * Although in the getProjetosAPI function, it returns the content property of the response data,
 * in this case, to access the users property inside the data object or an empty array if the content property is falsy.
 */
const fetchFromAPI = async (endpoint: string) => {
  const response = await axios.get(`${BASE_URL}/${endpoint}`);
  return response.data;
};

export const getUsersAPI = async () => {
  return await fetchFromAPI('users');
};

export const getProjetosAPI = async () => {
  const response = await axios.get(BASE_URL + '/projetos');
  return response.data.content || [];
};

export const addProjetoAPI = async (data: ProjetoFormData): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/projetos`, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error('Validation errors:', error.response.data);
    } else {
      console.error('Error adding project:', error);
    }
    throw error;
  }
};

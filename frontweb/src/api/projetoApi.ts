// api/projectApi.ts
import axios from 'axios';
import { BASE_URL } from '../util/requests';

export const fetchProjetosAPI = async () => {
  const response = await axios.get(`${BASE_URL}/projetos`);
  return response.data.content || [];
};
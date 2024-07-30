import { Projeto, ProjetoFormData } from '../types/projeto';
import { addProjetoAPI, getProjetosAPI, getProjetoByIdAPI } from '../api/requestsApi';

export const getProjetos = async (): Promise<Projeto[]> => {
  try {
    const projetosData = await getProjetosAPI();

    if (Array.isArray(projetosData)) {
      const projetosWithUsernames = projetosData.map((projeto) => ({
        ...projeto,
        users: projeto.users || [],
      }));

      return projetosWithUsernames;
    }

    return [];
  } catch (error) {
    console.error('Erro ao carregar os projetos:', error);
    return [];
  }
};

export const addProjeto = async (data: ProjetoFormData): Promise<void> => {
  try {
    await addProjetoAPI(data);
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const getProjetoById = async (id: number): Promise<Projeto> => {
  try {
    const projetoData = await getProjetoByIdAPI(id);
    return projetoData;
  } catch (error) {
    console.error('Erro ao carregar o projeto:', error);
    throw error;
  }
};

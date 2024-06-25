import { Projeto } from '../types/projeto';
import { addProjetoAPI, getProjetosAPI } from '../api/requestsApi';

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

export const addProjeto = async (projeto: Projeto): Promise<void> => {
  try {
    await addProjetoAPI(projeto);
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

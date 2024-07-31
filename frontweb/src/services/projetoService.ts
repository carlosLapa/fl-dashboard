import {
  Projeto,
  ProjetoFormData,
  ProjetoWithUsersAndTarefasDTO,
} from '../types/projeto';
import {
  addProjetoAPI,
  getProjetosAPI,
  getProjetoWithUsersAndTarefasAPI,
} from '../api/requestsApi';

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

//For the kanban board
export const getProjetoWithUsersAndTarefas = async (
  id: number
): Promise<ProjetoWithUsersAndTarefasDTO> => {
  try {
    const projetoData = await getProjetoWithUsersAndTarefasAPI(id);
    // Perform any necessary data treatment here
    return projetoData;
  } catch (error) {
    console.error('Error in projeto service:', error);
    throw error;
  }
};

import {
  PaginatedProjetos,
  Projeto,
  ProjetoFormData,
  ProjetoWithUsersAndTarefasDTO,
} from '../types/projeto';
import {
  addProjetoAPI,
  getProjetosAPI,
  getProjetoWithUsersAndTarefasAPI,
} from '../api/requestsApi';
  export const getProjetos = async (page: number = 0, pageSize: number = 10): Promise<PaginatedProjetos> => {
    try {
      const response = await getProjetosAPI(page, pageSize);
      return {
        content: response.content.map((projeto: Projeto) => ({
          ...projeto,
          users: projeto.users || [],
        })),
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        size: response.size,
        number: response.number
      };
    } catch (error) {
      console.error('Erro ao carregar os projetos:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: pageSize,
        number: page
      };
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

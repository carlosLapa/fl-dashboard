// projectService.ts
import { Projeto } from '../types/projeto';
import { getProjetosAPI } from '../api/requestsApi';

export const getProjetos = async (): Promise<Projeto[]> => {
  try {
    const projetosData = await getProjetosAPI();

    if (Array.isArray(projetosData)) {
      const projetosWithUsernames = projetosData.map((projeto) => ({
        ...projeto,
        users:
          projeto.users?.map(
            ({ id, username }: { id: number; username: string }) => ({
              id,
              username,
            })
          ) || [],
      }));

      return projetosWithUsernames;
    }

    return [];
  } catch (error) {
    console.error('Erro ao carregar os projetos:', error);
    return [];
  }
};

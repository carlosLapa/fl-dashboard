import axios from 'axios';
import { BASE_URL } from '../util/requests';
import { Tarefa } from '../types/tarefa';

export const updateTaskStatus = async (
  id: number,
  newStatus: Tarefa['status']
): Promise<Tarefa> => {
  try {
    const response = await axios.patch<Tarefa>(
      `${BASE_URL}/tarefas/with-associations/${id}`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

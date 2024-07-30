import axios from 'axios';
import { BASE_URL } from '../util/requests';
import { Task } from '../types/task';

export const fetchTasksForProject = async (
  projectId: number
): Promise<Task[]> => {
  try {
    const response = await axios.get<Task[]>(
      `${BASE_URL}/projetos/${projectId}/with-tarefas`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTaskStatus = async (
  taskId: number,
  newStatus: Task['status']
): Promise<Task> => {
  try {
    const response = await axios.patch<Task>(
      `${BASE_URL}/tarefas/with-associations/${taskId}`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

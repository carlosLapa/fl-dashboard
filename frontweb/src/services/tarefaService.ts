import axios from 'axios';
import { BASE_URL } from '../util/requests';
import { Tarefa, TarefaFormData } from '../types/tarefa';

export const getTarefas = async (): Promise<Tarefa[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/tarefas`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const getTarefaById = async (id: number): Promise<Tarefa | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/tarefas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with id ${id}:`, error);
    return null;
  }
};

export const getTarefasByUser = async (userId: number): Promise<Tarefa[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}/tarefas`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for user with id ${userId}:`, error);
    return [];
  }
};

export const getTarefasByProjeto = async (projetoId: number): Promise<Tarefa[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/projetos/${projetoId}/tarefas`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for project with id ${projetoId}:`, error);
    return [];
  }
};

export const updateTarefa = async (id: number, data: TarefaFormData): Promise<Tarefa | null> => {
  try {
    const response = await axios.put(`${BASE_URL}/tarefas/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating task with id ${id}:`, error);
    return null;
  }
};

export const deleteTarefa = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/tarefas/${id}`);
  } catch (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    throw error;
  }
};

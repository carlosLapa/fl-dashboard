import axios from 'axios';
import { BASE_URL } from '../util/requests';
import {
  Tarefa,
  TarefaFormData,
  TarefaStatus,
  TarefaWithUsersAndProjetoDTO,
  TarefaWithUsersDTO,
} from '../types/tarefa';
import {
  getTarefaWithUsersAndProjetoAPI,
  getTarefaWithUsersAPI,
  updateTarefaStatusAPI,
} from 'api/requestsApi';
import { ColunaWithProjetoDTO } from 'types/coluna';

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

export const getTarefasByProjeto = async (
  projetoId: number
): Promise<Tarefa[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/projetos/${projetoId}/tarefas`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching tasks for project with id ${projetoId}:`,
      error
    );
    return [];
  }
};

export const updateTarefa = async (
  id: number,
  data: TarefaFormData
): Promise<Tarefa | null> => {
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

export const getTarefaWithUsersAndProjeto = async (
  id: number
): Promise<TarefaWithUsersAndProjetoDTO> => {
  try {
    const tarefaData = await getTarefaWithUsersAndProjetoAPI(id);
    // Perform any necessary data treatment here
    return tarefaData;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const getTarefaWithUsers = async (
  id: number
): Promise<TarefaWithUsersDTO> => {
  try {
    const tarefaData = await getTarefaWithUsersAPI(id);
    // Perform any necessary data treatment here
    return tarefaData;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const getColumnsForProject = async (
  projetoId: number
): Promise<ColunaWithProjetoDTO[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/colunas/projeto/${projetoId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching columns:', error);
    return [];
  }
};

export const updateTarefaStatus = async (
  id: number,
  newStatus: TarefaStatus
): Promise<TarefaWithUsersDTO> => {
  try {
    const updatedTarefa = await updateTarefaStatusAPI(id, newStatus);
    // Perform any necessary data treatment here
    return updatedTarefa;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

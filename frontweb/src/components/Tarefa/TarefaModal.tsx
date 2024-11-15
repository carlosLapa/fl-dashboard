// src/components/Tarefa/TarefaModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from '../../types/tarefa';
import { User } from 'types/user';
import { Projeto } from 'types/projeto';
import { getUsersAPI, getProjetosAPI } from '../../api/requestsApi';

interface TarefaModalProps {
  show: boolean;
  onHide: () => void;
  tarefa?: Tarefa | null;
  onSave: (formData: TarefaInsertFormData | TarefaUpdateFormData) => void;
  isEditing: boolean;
  onStatusChange?: (tarefaId: number, newStatus: TarefaStatus) => void;
}

const TarefaModal: React.FC<TarefaModalProps> = ({
  show,
  onHide,
  tarefa,
  onSave,
  isEditing,
  onStatusChange,
}) => {
  const [formData, setFormData] = useState<
    TarefaInsertFormData | TarefaUpdateFormData
  >({
    descricao: '',
    prioridade: '',
    prazoEstimado: '',
    prazoReal: '',
    status: 'BACKLOG',
    projetoId: 0,
    userIds: [],
  });

  const [users, setUsers] = useState<User[]>([]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    const fetchUsersAndProjetos = async () => {
      const usersData = await getUsersAPI();
      const projetosData = await getProjetosAPI();
      setUsers(usersData);
      setProjetos(projetosData);
    };

    fetchUsersAndProjetos();
  }, []);

  useEffect(() => {
    if (isEditing && tarefa) {
      setFormData({
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        prazoEstimado: tarefa.prazoEstimado
          ? new Date(tarefa.prazoEstimado).toISOString().split('T')[0]
          : '',
        prazoReal: tarefa.prazoReal
          ? new Date(tarefa.prazoReal).toISOString().split('T')[0]
          : '',
        status: tarefa.status,
        projetoId: tarefa.projeto.id,
        userIds: tarefa.users.map((user) => user.id),
      });
    } else {
      setFormData({
        descricao: '',
        prioridade: '',
        prazoEstimado: '',
        prazoReal: '',
        status: 'BACKLOG',
        projetoId: 0,
        userIds: [],
      });
    }
  }, [isEditing, tarefa]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    if (name === 'status' && isEditing && tarefa) {
      onStatusChange?.(tarefa.id, value as TarefaStatus);
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserSelect = (userId: number) => {
    setFormData((prevData) => ({
      ...prevData,
      userIds: prevData.userIds.includes(userId)
        ? prevData.userIds.filter((id) => id !== userId)
        : [...prevData.userIds, userId],
    }));
  };

  const handleSave = () => {
    if (formData.projetoId === 0) {
      alert('Please select a valid project');
      return;
    }
    if (isEditing && tarefa) {
      onSave({ ...formData, id: tarefa.id } as TarefaUpdateFormData);
    } else {
      onSave(formData as TarefaInsertFormData);
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formDescricao">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formPrioridade">
            <Form.Label>Prioridade</Form.Label>
            <Form.Control
              type="text"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formStatus">
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formPrazoEstimado">
            <Form.Label>Prazo Estimado</Form.Label>
            <Form.Control
              type="date"
              name="prazoEstimado"
              value={formData.prazoEstimado}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formPrazoReal">
            <Form.Label>Prazo Real</Form.Label>
            <Form.Control
              type="date"
              name="prazoReal"
              value={formData.prazoReal}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formProjeto">
            <Form.Label>Projeto</Form.Label>
            <Form.Control
              as="select"
              name="projetoId"
              value={formData.projetoId}
              onChange={handleInputChange}
            >
              <option value={0}>Selecione um projeto</option>
              {Array.isArray(projetos) &&
                projetos.map((projeto) => (
                  <option key={projeto.id} value={projeto.id}>
                    {projeto.designacao}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formUsers">
            <Form.Label>Usuários Atribuídos</Form.Label>
            {Array.isArray(users) ? (
              users.map((user) => (
                <Form.Check
                  key={user.id}
                  type="checkbox"
                  label={user.name}
                  checked={formData.userIds.includes(user.id)}
                  onChange={() => handleUserSelect(user.id)}
                />
              ))
            ) : (
              <p>Não foram encontrados Colaboradores</p>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TarefaModal;

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { TarefaFormData } from '../../types/tarefa';
import { User } from 'types/user';
import { Projeto } from 'types/projeto';
import { getUsersAPI, getProjetosAPI } from '../../api/requestsApi';

interface TarefaModalProps {
  show: boolean;
  onHide: () => void;
  tarefa?: TarefaFormData | null;
  onSave: (formData: TarefaFormData) => void;
  isEditing: boolean;
}

const TarefaModal: React.FC<TarefaModalProps> = ({
  show,
  onHide,
  tarefa,
  onSave,
  isEditing,
}) => {
  const [formData, setFormData] = useState<TarefaFormData>({
    descricao: '',
    prioridade: '',
    prazoEstimado: '',
    prazoReal: '',
    status: 'BACKLOG',
    projeto: {
      id: 0,
      designacao: '',
      projetoAno: 0,
      entidade: '',
      prioridade: '',
      observacao: '',
      prazo: '',
      users: [],
    },
    users: [],
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
      setFormData(tarefa);
    } else {
      setFormData({
        descricao: '',
        prioridade: '',
        prazoEstimado: '',
        prazoReal: '',
        status: 'BACKLOG',
        projeto: {
          id: 0,
          designacao: '',
          projetoAno: 0,
          entidade: '',
          prioridade: '',
          observacao: '',
          prazo: '',
          users: [],
        },
        users: [],
      });
    }
  }, [isEditing, tarefa]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserSelect = (userId: number) => {
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser) {
      setFormData((prevData) => ({
        ...prevData,
        users: prevData.users.includes(selectedUser)
          ? prevData.users.filter((user) => user.id !== userId)
          : [...prevData.users, selectedUser],
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
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
              name="projeto"
              value={formData.projeto.id}
              onChange={handleInputChange}
            >
              <option value={0}>Selecione um projeto</option>
              {projetos.map((projeto) => (
                <option key={projeto.id} value={projeto.id}>
                  {projeto.designacao}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="formUsers">
            <Form.Label>Colaboradores</Form.Label>
            {users.map((user) => (
              <Form.Check
                key={user.id}
                type="checkbox"
                label={user.username}
                checked={formData.users.some((u) => u.id === user.id)}
                onChange={() => handleUserSelect(user.id)}
              />
            ))}
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

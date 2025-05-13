import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from '../../types/tarefa';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { User } from 'types/user';
import { Projeto } from 'types/projeto';
import { getUsersAPI, getProjetosAPI } from '../../api/requestsApi';
import { toast } from 'react-toastify';

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
  const { sendNotification } = useNotification();
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsersAndProjetos = async () => {
      setIsLoading(true);
      try {
        const usersData = await getUsersAPI();
        const projetosData = await getProjetosAPI();
        setUsers(usersData);
        setProjetos(projetosData.content);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    if (show) {
      fetchUsersAndProjetos();
    }
  }, [show]);

  useEffect(() => {
    if (isEditing && tarefa) {
      setFormData({
        id: tarefa.id,
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
  }, [isEditing, tarefa, show]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;
    if (name === 'status' && isEditing && tarefa) {
      onStatusChange?.(tarefa.id, value as TarefaStatus);
      const notification = {
        type: NotificationType.TAREFA_STATUS_ALTERADO,
        content: `Status da tarefa "${tarefa.descricao}" alterado para ${value}`,
        userId: tarefa.users[0]?.id,
        tarefaId: tarefa.id,
        projetoId: tarefa.projeto.id,
        relatedId: tarefa.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      sendNotification(notification);
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
      toast.warning('Por favor, selecione um projeto válido');
      return;
    }

    if (!formData.descricao.trim()) {
      toast.warning('Por favor, forneça uma descrição para a tarefa');
      return;
    }

    if (isEditing && tarefa) {
      onSave({ ...formData, id: tarefa.id } as TarefaUpdateFormData);
      const notification = {
        type: NotificationType.TAREFA_STATUS_ALTERADO,
        content: `Tarefa "${formData.descricao}" foi atualizada`,
        userId: formData.userIds[0],
        tarefaId: tarefa.id,
        projetoId: formData.projetoId,
        relatedId: tarefa.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      sendNotification(notification);
    } else {
      onSave(formData as TarefaInsertFormData);
      formData.userIds.forEach((userId) => {
        const notification = {
          type: NotificationType.TAREFA_ATRIBUIDA,
          content: `Nova tarefa atribuída: "${formData.descricao}"`,
          userId: userId,
          tarefaId: 0, // Will be updated after task creation
          projetoId: formData.projetoId,
          relatedId: 0, // Will be updated after task creation
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        sendNotification(notification);
      });
    }
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <div className="text-center py-4">Carregando dados...</div>
        ) : (
          <Form>
            <Row>
              <Col xs={12}>
                <Form.Group controlId="formDescricao" className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId="formPrioridade" className="mb-3">
                  <Form.Label>Prioridade</Form.Label>
                  <Form.Control
                    type="text"
                    name="prioridade"
                    value={formData.prioridade}
                    onChange={handleInputChange}
                    placeholder="Alta, Média, Baixa"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="formStatus" className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId="formPrazoEstimado" className="mb-3">
                  <Form.Label>Prazo Estimado</Form.Label>
                  <Form.Control
                    type="date"
                    name="prazoEstimado"
                    value={formData.prazoEstimado}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="formPrazoReal" className="mb-3">
                  <Form.Label>Prazo Real</Form.Label>
                  <Form.Control
                    type="date"
                    name="prazoReal"
                    value={formData.prazoReal}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Form.Group controlId="formProjeto" className="mb-3">
                  <Form.Label>Projeto</Form.Label>
                  <Form.Select
                    name="projetoId"
                    value={formData.projetoId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Selecione um projeto</option>
                    {Array.isArray(projetos) &&
                      projetos.map((projeto) => (
                        <option key={projeto.id} value={projeto.id}>
                          {projeto.designacao}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Form.Group controlId="formUsers" className="mb-3">
                  <Form.Label>Usuários Atribuídos</Form.Label>
                  <div
                    className="user-checkbox-container"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {Array.isArray(users) && users.length > 0 ? (
                      <Row>
                        {users.map((user) => (
                          <Col xs={12} md={6} key={user.id}>
                            <Form.Check
                              type="checkbox"
                              label={user.name}
                              checked={formData.userIds.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                              className="mb-2"
                            />
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <p>Não foram encontrados Colaboradores</p>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isEditing ? 'Salvar Alterações' : 'Criar Tarefa'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TarefaModal;

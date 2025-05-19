import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from '../../types/tarefa';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { User } from 'types/user';
import { getUsersAPI, searchProjetosAPI } from '../../api/requestsApi';
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
  const [isLoading, setIsLoading] = useState(false);

  // Project search state
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectSearchResults, setProjectSearchResults] = useState<
    Array<{ id: number; designacao: string }>
  >([]);
  const [isSearchingProjects, setIsSearchingProjects] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // Fetch users when modal opens
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersData = await getUsersAPI();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erro ao carregar colaboradores');
      } finally {
        setIsLoading(false);
      }
    };

    if (show) {
      fetchUsers();
    }
  }, [show]);

  // Set form data when editing
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

      // Set the selected project name for display
      setSelectedProjectName(tarefa.projeto.designacao);
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
      setSelectedProjectName('');
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

  // Handle project search
  const handleProjectSearch = async () => {
    if (!projectSearchQuery.trim()) {
      setProjectSearchResults([]);
      return;
    }

    setIsSearchingProjects(true);
    try {
      const response = await searchProjetosAPI(projectSearchQuery);
      console.log('Project search response:', response);

      if (response && response.content && response.content.length > 0) {
        setProjectSearchResults(response.content);
        console.log('Setting project results:', response.content);
      } else {
        setProjectSearchResults([]);
        toast.info('Nenhum projeto encontrado com esse termo de busca');
      }
    } catch (error) {
      console.error('Error searching projects:', error);
      toast.error('Erro ao pesquisar projetos');
      setProjectSearchResults([]);
    } finally {
      setIsSearchingProjects(false);
    }
  };

  // Handle project selection
  const handleSelectProject = (projeto: any) => {
    console.log('Selected project:', projeto);

    setFormData((prevData) => ({
      ...prevData,
      projetoId: projeto.id,
    }));
    setSelectedProjectName(projeto.designacao);
    setProjectSearchResults([]);
    setProjectSearchQuery('');
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
                    placeholder="Urgente, Alta, Média, Baixa"
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

            {/* Project search field */}
            <Row>
              <Col xs={12}>
                <Form.Group controlId="formProjeto" className="mb-3">
                  <Form.Label>Projeto</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Pesquisar projeto..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleProjectSearch();
                        }
                      }}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleProjectSearch}
                      disabled={isSearchingProjects}
                    >
                      {isSearchingProjects ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </InputGroup>

                  {selectedProjectName && (
                    <div className="mt-2">
                      <strong>Projeto selecionado:</strong>{' '}
                      {selectedProjectName}
                    </div>
                  )}

                  {projectSearchResults.length > 0 && (
                    <div
                      className="mt-2 border rounded p-2"
                      style={{ maxHeight: '200px', overflowY: 'auto' }}
                    >
                      <h6>Resultados da busca:</h6>
                      <ul className="list-group">
                        {projectSearchResults.map((projeto) => (
                          <li
                            key={projeto.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelectProject(projeto)}
                            style={{ cursor: 'pointer' }}
                          >
                            {projeto.designacao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Users section */}
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
                      <p>Nenhum usuário disponível</p>
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
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TarefaModal;

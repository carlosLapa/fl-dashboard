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

// Helper function to calculate working days between two dates
const calculateWorkingDays = (
  startDateStr: string,
  endDateStr: string
): number => {
  if (!startDateStr || !endDateStr) return 0;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  let workingDays = 0;
  let currentDate = new Date(startDate);

  // Set both dates to midnight to ensure we're only comparing dates, not times
  currentDate.setHours(0, 0, 0, 0);
  const endDateMidnight = new Date(endDate);
  endDateMidnight.setHours(0, 0, 0, 0);

  // Count working days
  while (currentDate <= endDateMidnight) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      // 0 is Sunday, 6 is Saturday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

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
  // Working days state
  const [workingDays, setWorkingDays] = useState<number>(0);

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
      const prazoEstimado = tarefa.prazoEstimado
        ? new Date(tarefa.prazoEstimado).toISOString().split('T')[0]
        : '';
      const prazoReal = tarefa.prazoReal
        ? new Date(tarefa.prazoReal).toISOString().split('T')[0]
        : '';

      setFormData({
        id: tarefa.id,
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        prazoEstimado: prazoEstimado,
        prazoReal: prazoReal,
        status: tarefa.status,
        projetoId: tarefa.projeto.id,
        userIds: tarefa.users.map((user) => user.id),
      });

      // Set the selected project name for display
      setSelectedProjectName(tarefa.projeto.designacao);

      // Calculate working days if both dates are available
      if (prazoEstimado && prazoReal) {
        // Use existing workingDays if available, otherwise calculate
        if (tarefa.workingDays !== undefined) {
          setWorkingDays(tarefa.workingDays);
        } else {
          setWorkingDays(calculateWorkingDays(prazoEstimado, prazoReal));
        }
      } else {
        setWorkingDays(0);
      }
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
      setWorkingDays(0);
    }
  }, [isEditing, tarefa, show]);

  // Calculate working days when dates change
  useEffect(() => {
    if (formData.prazoEstimado && formData.prazoReal) {
      setWorkingDays(
        calculateWorkingDays(formData.prazoEstimado, formData.prazoReal)
      );
    } else {
      setWorkingDays(0);
    }
  }, [formData.prazoEstimado, formData.prazoReal]);

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

    // Include workingDays in the form data if both dates are available
    const updatedFormData = {
      ...formData,
      workingDays:
        formData.prazoEstimado && formData.prazoReal ? workingDays : undefined,
    };

    if (isEditing && tarefa) {
      onSave({ ...updatedFormData, id: tarefa.id } as TarefaUpdateFormData);
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
      onSave(updatedFormData as TarefaInsertFormData);
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
                  <Form.Label>Início</Form.Label>{' '}
                  {/* Changed from "Prazo Estimado" */}
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
                  <Form.Label>Prazo</Form.Label>{' '}
                  {/* Changed from "Prazo Real" */}
                  <Form.Control
                    type="date"
                    name="prazoReal"
                    value={formData.prazoReal}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Working Days display - update the description text */}
            {formData.prazoEstimado && formData.prazoReal && (
              <Row>
                <Col xs={12}>
                  <Form.Group controlId="formWorkingDays" className="mb-3">
                    <Form.Label>Dias Úteis</Form.Label>
                    <Form.Control
                      type="text"
                      value={`${workingDays} dia(s)`}
                      readOnly
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Número de dias úteis entre a data de início e o prazo
                      (excluindo fins de semana).
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            )}
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

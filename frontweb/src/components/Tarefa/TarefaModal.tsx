import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Tabs,
  Tab,
} from 'react-bootstrap';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from '../../types/tarefa';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { User } from 'types/user';
import { Projeto, ProjetoMinDTO } from 'types/projeto';
import { ExternoDTO } from 'types/externo';
import {
  getUsersAPI,
  searchProjetosAPI,
  getProjetoDetailsAPI,
} from '../../api/requestsApi';
import { getAllExternosAPI } from '../../api/externoApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

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
    externoIds: [],
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
  const [externos, setExternos] = useState<ExternoDTO[]>([]);
  const [activeTab, setActiveTab] = useState('colaboradores');
  // Add state for selected project details including deadline
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  // Add state for deadline validation
  const [isDeadlineValid, setIsDeadlineValid] = useState(true);
  const [deadlineErrorMessage, setDeadlineErrorMessage] = useState('');

  // Fetch users and externos when modal opens
  useEffect(() => {
    if (!show) return;
    setIsLoading(true);
    Promise.all([getUsersAPI(), getAllExternosAPI()])
      .then(([usersData, externosData]) => {
        setUsers(usersData.content || []);
        setExternos(externosData);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setIsLoading(false));
  }, [show]);

  // Fetch project details when a project is selected
  useEffect(() => {
    if (formData.projetoId && formData.projetoId > 0) {
      getProjetoDetailsAPI(formData.projetoId)
        .then((project) => {
          setSelectedProject(project);
          // Validate deadline when project changes
          validateDeadline(formData.prazoReal, project);
        })
        .catch((error) => {
          console.error('Error fetching project details:', error);
          setSelectedProject(null);
        });
    } else {
      setSelectedProject(null);
      setIsDeadlineValid(true);
      setDeadlineErrorMessage('');
    }
  }, [formData.projetoId]);

  // Set form data when editing
  useEffect(() => {
    if (isEditing && tarefa) {
      setFormData({
        id: tarefa.id,
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        prazoEstimado: tarefa.prazoEstimado
          ? tarefa.prazoEstimado.split('T')[0]
          : '',
        prazoReal: tarefa.prazoReal ? tarefa.prazoReal.split('T')[0] : '',
        status: tarefa.status,
        projetoId: tarefa.projeto.id,
        userIds: tarefa.users.map((user) => user.id),
        externoIds: tarefa.externos?.map((externo) => externo.id) || [],
      });
      setSelectedProjectName(tarefa.projeto.designacao);
      setWorkingDays(
        tarefa.workingDays ??
          calculateWorkingDays(
            tarefa.prazoEstimado?.split('T')[0] || '',
            tarefa.prazoReal?.split('T')[0] || ''
          )
      );

      // Fetch project details for deadline validation
      getProjetoDetailsAPI(tarefa.projeto.id)
        .then((project) => {
          setSelectedProject(project);
          validateDeadline(tarefa.prazoReal?.split('T')[0], project);
        })
        .catch((error) => {
          console.error('Error fetching project details:', error);
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
        externoIds: [],
      });
      setSelectedProjectName('');
      setWorkingDays(0);
      setSelectedProject(null);
      setIsDeadlineValid(true);
      setDeadlineErrorMessage('');
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

  // Validate deadline when task deadline changes
  useEffect(() => {
    if (selectedProject && formData.prazoReal) {
      validateDeadline(formData.prazoReal, selectedProject);
    }
  }, [formData.prazoReal, selectedProject]);

  // Function to validate task deadline against project deadline
  const validateDeadline = (taskDeadlineStr?: string, project?: Projeto) => {
    if (!taskDeadlineStr || !project || !project.prazo) {
      setIsDeadlineValid(true);
      setDeadlineErrorMessage('');
      return true;
    }

    const taskDeadline = new Date(taskDeadlineStr);
    const projectDeadline = new Date(project.prazo.split('T')[0]);

    // Set time to midnight to compare only dates
    taskDeadline.setHours(0, 0, 0, 0);
    projectDeadline.setHours(0, 0, 0, 0);

    const isValid = taskDeadline <= projectDeadline;
    setIsDeadlineValid(isValid);

    if (!isValid) {
      setDeadlineErrorMessage(
        `O prazo da tarefa (${format(
          taskDeadline,
          'dd/MM/yyyy'
        )}) não pode exceder o prazo final do projeto (${format(
          projectDeadline,
          'dd/MM/yyyy'
        )})`
      );
    } else {
      setDeadlineErrorMessage('');
    }

    return isValid;
  };

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

    // For deadline changes, validate immediately
    if (name === 'prazoReal' && selectedProject) {
      const isValid = validateDeadline(value, selectedProject);
      if (!isValid) {
        // Optionally show toast warning immediately
        // toast.warning(deadlineErrorMessage);
      }
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
      if (response && response.content && response.content.length > 0) {
        setProjectSearchResults(response.content);
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
  const handleSelectProject = (projeto: ProjetoMinDTO) => {
    setFormData((prevData) => ({
      ...prevData,
      projetoId: projeto.id,
    }));
    setSelectedProjectName(projeto.designacao);
    setProjectSearchResults([]);
    setProjectSearchQuery('');

    // Fetch complete project details
    getProjetoDetailsAPI(projeto.id)
      .then((project: Projeto) => {
        setSelectedProject(project);
        // Validate current deadline against new project
        if (formData.prazoReal) {
          validateDeadline(formData.prazoReal, project);
        }
      })
      .catch((error) => {
        console.error('Error fetching project details:', error);
        setSelectedProject(null);
      });
  };

  const handleUserSelect = (userId: number) => {
    setFormData((prevData) => ({
      ...prevData,
      userIds: prevData.userIds.includes(userId)
        ? prevData.userIds.filter((id) => id !== userId)
        : [...prevData.userIds, userId],
    }));
  };

  // Handle externo selection
  const handleExternoSelect = (externoId: number) => {
    setFormData((prevData) => ({
      ...prevData,
      externoIds: prevData.externoIds?.includes(externoId)
        ? prevData.externoIds.filter((id) => id !== externoId)
        : [...(prevData.externoIds || []), externoId],
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

    // Validate deadline before saving
    if (selectedProject && formData.prazoReal) {
      const isValid = validateDeadline(formData.prazoReal, selectedProject);
      if (!isValid) {
        toast.error(deadlineErrorMessage);
        return;
      }
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
                  <Form.Label>Estado</Form.Label>
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
                  <Form.Label>Início</Form.Label>
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
                  <Form.Label>Prazo</Form.Label>
                  <Form.Control
                    type="date"
                    name="prazoReal"
                    value={formData.prazoReal}
                    onChange={handleInputChange}
                    isInvalid={!isDeadlineValid}
                  />
                  {!isDeadlineValid && (
                    <Form.Control.Feedback type="invalid">
                      {deadlineErrorMessage}
                    </Form.Control.Feedback>
                  )}
                  {selectedProject?.prazo && (
                    <Form.Text className="text-muted">
                      Prazo do projeto:{' '}
                      {format(new Date(selectedProject.prazo), 'dd/MM/yyyy')}
                    </Form.Text>
                  )}
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
            {/* Users and Externos Tabs */}
            <Row>
              <Col xs={12}>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k || 'colaboradores')}
                  className="mb-3"
                >
                  <Tab eventKey="colaboradores" title="Colaboradores">
                    <Form.Group controlId="formUsers" className="mb-3">
                      <Form.Label>Colaboradores Atribuídos</Form.Label>
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
                          <p>Nenhum colaborador disponível</p>
                        )}
                      </div>
                    </Form.Group>
                  </Tab>
                  <Tab eventKey="externos" title="Externos">
                    <Form.Group controlId="formExternos" className="mb-3">
                      <Form.Label>Externos Atribuídos</Form.Label>
                      <div
                        className="externo-checkbox-container"
                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {Array.isArray(externos) && externos.length > 0 ? (
                          <Row>
                            {externos.map((externo) => (
                              <Col xs={12} md={6} key={externo.id}>
                                <Form.Check
                                  type="checkbox"
                                  label={`${
                                    externo.name
                                  } (${externo.especialidades.join(', ')})`}
                                  checked={
                                    formData.externoIds?.includes(externo.id) ||
                                    false
                                  }
                                  onChange={() =>
                                    handleExternoSelect(externo.id)
                                  }
                                  className="mb-2"
                                />
                              </Col>
                            ))}
                          </Row>
                        ) : (
                          <p>Nenhum externo disponível</p>
                        )}
                      </div>
                    </Form.Group>
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isDeadlineValid && formData.prazoReal !== ''}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TarefaModal;

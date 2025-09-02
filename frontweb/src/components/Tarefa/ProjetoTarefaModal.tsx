import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { TarefaInsertFormData } from '../../types/tarefa';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { User } from 'types/user';
import { Projeto } from 'types/projeto';
import { ExternoDTO } from 'types/externo';
import { getUsersAPI, getProjetoDetailsAPI } from '../../api/requestsApi';
import { getAllExternosAPI } from '../../api/externoApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface ProjetoTarefaModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (formData: TarefaInsertFormData) => void;
  projetoId: number; // Obrigatório - ID do projeto
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

const ProjetoTarefaModal: React.FC<ProjetoTarefaModalProps> = ({
  show,
  onHide,
  onSave,
  projetoId,
}) => {
  const { sendNotification } = useNotification();
  const [formData, setFormData] = useState<TarefaInsertFormData>({
    descricao: '',
    prioridade: '',
    prazoEstimado: '',
    prazoReal: '',
    status: 'BACKLOG',
    projetoId: projetoId, // Inicializa com o ID do projeto
    userIds: [],
    externoIds: [], // Garantir que sempre seja inicializado como array vazio
  });

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Working days state
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [externos, setExternos] = useState<ExternoDTO[]>([]);
  const [activeTab, setActiveTab] = useState('colaboradores');

  // Projeto já é conhecido, então carregamos seus detalhes
  const [projeto, setProjeto] = useState<Projeto | null>(null);

  // Add state for deadline validation
  const [isDeadlineValid, setIsDeadlineValid] = useState(true);
  const [deadlineErrorMessage, setDeadlineErrorMessage] = useState('');

  // Fetch users, externos and project details when modal opens
  useEffect(() => {
    if (!show) return;

    setIsLoading(true);

    // Carrega usuários, externos e detalhes do projeto
    Promise.all([
      getUsersAPI(),
      getAllExternosAPI(),
      getProjetoDetailsAPI(projetoId),
    ])
      .then(([usersData, externosData, projetoData]) => {
        setUsers(usersData.content || []);
        setExternos(externosData);
        setProjeto(projetoData);

        // Atualiza o formulário com o ID e designação do projeto
        setFormData((prev) => ({
          ...prev,
          projetoId: projetoData.id,
        }));
      })
      .catch((error) => {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      })
      .finally(() => setIsLoading(false));
  }, [show, projetoId]);

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
    if (projeto && formData.prazoReal) {
      validateDeadline(formData.prazoReal, projeto);
    }
  }, [formData.prazoReal, projeto]);

  // Reset form when modal is opened
  useEffect(() => {
    if (show) {
      setFormData({
        descricao: '',
        prioridade: '',
        prazoEstimado: '',
        prazoReal: '',
        status: 'BACKLOG',
        projetoId: projetoId,
        userIds: [],
        externoIds: [], // Garantir que sempre seja inicializado como array vazio
      });
      setWorkingDays(0);
      setIsDeadlineValid(true);
      setDeadlineErrorMessage('');
    }
  }, [show, projetoId]);

  // Function to validate task deadline against project deadline
  const validateDeadline = (taskDeadlineStr?: string, project?: Projeto) => {
    if (!taskDeadlineStr) {
      setIsDeadlineValid(true);
      setDeadlineErrorMessage('');
      return true;
    }

    // Se não tiver projeto ou projeto sem prazo, mostra mensagem específica
    if (!project || !project.prazo) {
      // Se o projeto não tem prazo definido, podemos avisar o usuário
      if (project && !project.prazo) {
        setIsDeadlineValid(true); // Ainda permitimos a criação
        setDeadlineErrorMessage(
          'Nota: O projeto não possui prazo final definido.'
        );
        return true;
      }

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

    // Para alterações no prazo, validar imediatamente
    if (name === 'prazoReal' && projeto) {
      const isValid = validateDeadline(value, projeto);
      if (!isValid) {
        // Opcionalmente exibir aviso imediatamente
        // toast.warning(deadlineErrorMessage);
      }
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

  // Corrigido: usando fallback para array vazio se externoIds for undefined
  const handleExternoSelect = (externoId: number) => {
    setFormData((prevData) => {
      // Garantir que externoIds seja sempre um array
      const currentExternoIds = prevData.externoIds || [];

      return {
        ...prevData,
        externoIds: currentExternoIds.includes(externoId)
          ? currentExternoIds.filter((id) => id !== externoId)
          : [...currentExternoIds, externoId],
      };
    });
  };

  const handleSave = () => {
    if (!formData.descricao.trim()) {
      toast.warning('Por favor, forneça uma descrição para a tarefa');
      return;
    }

    // Validate deadline before saving
    if (projeto && formData.prazoReal) {
      const isValid = validateDeadline(formData.prazoReal, projeto);
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

    onSave(updatedFormData);

    // Enviar notificações para os usuários atribuídos
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

    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Criar Nova Tarefa
          {projeto && (
            <span className="ms-2 text-muted">- {projeto.designacao}</span>
          )}
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
                  {deadlineErrorMessage &&
                    (isDeadlineValid ? (
                      <Form.Text className="text-warning">
                        {deadlineErrorMessage}
                      </Form.Text>
                    ) : (
                      <Form.Control.Feedback type="invalid">
                        {deadlineErrorMessage}
                      </Form.Control.Feedback>
                    ))}
                  {projeto?.prazo && (
                    <Form.Text className="text-muted">
                      Prazo do projeto:{' '}
                      {format(new Date(projeto.prazo), 'dd/MM/yyyy')}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Working Days display */}
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

            {/* Projeto já está selecionado, então apenas mostramos sua designação */}
            <Row>
              <Col xs={12}>
                <Form.Group controlId="formProjeto" className="mb-3">
                  <Form.Label>Projeto</Form.Label>
                  <Form.Control
                    type="text"
                    value={projeto?.designacao || ''}
                    disabled
                  />
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
                                  checked={(formData.externoIds || []).includes(
                                    externo.id
                                  )}
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
          Criar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjetoTarefaModal;

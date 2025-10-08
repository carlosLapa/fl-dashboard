import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { PaginatedUsers } from 'types/user';
import { getUsersAPI } from '../../api/requestsApi';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { getAllExternos } from '../../services/externoService';
import { Externo } from '../../types/externo';
import ExternosSelect from '../../components/ExternoSelect/ExternosSelect';
import ClienteSelect from '../../components/ClienteSelect/ClienteSelect';
import './ProjetoModal.scss';

// Add the ClienteInfo interface
interface ClienteInfo {
  id: number;
  name: string;
}

interface ProjetoModalProps {
  show: boolean;
  onHide: () => void;
  projeto?: Projeto | null;
  onSave: (formData: ProjetoFormData) => void;
  isEditing: boolean;
  clienteInfo?: ClienteInfo;
  initialFormData?: ProjetoFormData | null;
}

const ProjetoModal: React.FC<ProjetoModalProps> = ({
  show,
  onHide,
  projeto,
  onSave,
  isEditing,
  clienteInfo,
  initialFormData,
}) => {
  const { sendNotification } = useNotification();
  const [formData, setFormData] = useState<ProjetoFormData>({
    projetoAno: new Date().getFullYear(),
    designacao: '',
    entidade: '',
    prioridade: '',
    observacao: '',
    prazo: '',
    users: [],
    externos: [],
    status: 'ATIVO',
    coordenadorId: undefined,
    dataProposta: '',
    dataAdjudicacao: '',
  });
  const [users, setUsers] = useState<PaginatedUsers>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
  });
  const [externos, setExternos] = useState<Externo[]>([]);
  const [isLoadingExternos, setIsLoadingExternos] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuários e colaboradores externos quando o modal é aberto
  useEffect(() => {
    const fetchUsersAndExternos = async () => {
      try {
        const usersData = await getUsersAPI();
        setUsers(usersData);

        setIsLoadingExternos(true);
        const externosData = await getAllExternos();
        setExternos(externosData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Não foi possível carregar a lista de colaboradores.');
      } finally {
        setIsLoadingExternos(false);
      }
    };

    if (show) {
      fetchUsersAndExternos();
    }
  }, [show]);

  // Função utilitária para garantir formato yyyy-mm-dd
  function toInputDate(dateStr?: string): string {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(
        2,
        '0'
      )}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return '';
  }

  useEffect(() => {
    if (!isEditing) {
      let newFormData: ProjetoFormData = {
        projetoAno: new Date().getFullYear(),
        designacao: '',
        entidade: '',
        prioridade: '',
        observacao: '',
        prazo: '',
        users: [],
        externos: [],
        status: 'ATIVO',
        coordenadorId: undefined,
        dataProposta: '',
        dataAdjudicacao: '',
      };
      if (clienteInfo) {
        newFormData.clienteId = clienteInfo.id;
      }
      // Se vier initialFormData, usar para preencher
      if (initialFormData) {
        newFormData = {
          ...newFormData,
          ...initialFormData,
          prazo: toInputDate(initialFormData.prazo),
          dataProposta: toInputDate(initialFormData.dataProposta),
          dataAdjudicacao: toInputDate(initialFormData.dataAdjudicacao),
        };
      }
      setFormData(newFormData);
      setValidated(false);
    }
  }, [isEditing, show, clienteInfo, initialFormData]);

  useEffect(() => {
    if (isEditing && projeto) {
      const newFormData: ProjetoFormData = {
        ...projeto,
        prazo: toInputDate(projeto.prazo),
        dataProposta: toInputDate(projeto.dataProposta),
        dataAdjudicacao: toInputDate(projeto.dataAdjudicacao),
        externos: projeto.externos || [],
        clienteId: projeto.cliente?.id || clienteInfo?.id,
      };

      // If clienteInfo is provided (meaning we're adding a project from client view)
      // override any existing clienteId
      if (clienteInfo) {
        newFormData.clienteId = clienteInfo.id;
      }

      setFormData(newFormData);
      setValidated(false);
    }
  }, [projeto, isEditing, show, clienteInfo]);

  const handleUserSelect = (selectedOptions: any) => {
    const selectedUsers = selectedOptions
      ? selectedOptions.map((option: any) => ({
          id: option.value,
          name: option.label,
          email: '',
          role: '',
        }))
      : [];
    setFormData((prevFormData) => ({
      ...prevFormData,
      users: selectedUsers,
    }));
  };

  // Manipulador para colaboradores externos usando o novo componente
  const handleExternoChange = (selectedExternos: Externo[]) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      externos: selectedExternos,
    }));
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (formData.designacao.trim() === '' || formData.entidade.trim() === '') {
      toast.error('Designação e Entidade são campos obrigatórios');
      return false;
    }

    if (formData.prazo) {
      const prazoDate = new Date(formData.prazo);
      if (prazoDate < new Date()) {
        toast.error('O prazo não pode ser anterior à data atual');
        return false;
      }
    }

    if (!clienteInfo && !formData.clienteId) {
      toast.error('Selecionar um cliente é obrigatório');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    setValidated(true);
    if (!validateForm()) return;

    // Create a copy of the form data to send
    const formDataToSave = { ...formData };

    // Sempre incluir o campo externoIds, mesmo que vazio
    // Isso sinalizará ao backend que queremos atualizar a lista de externos
    formDataToSave.externoIds =
      formData.externos?.map((externo) => externo.id) || [];

    // Se o backend não espera o campo 'externos' completo, removê-lo
    if (formDataToSave.externos) {
      delete formDataToSave.externos;
    }

    // Priorize clienteId do clienteInfo (quando presente) sobre o clienteId do formulário
    if (clienteInfo) {
      formDataToSave.clienteId = clienteInfo.id;
    } else if (!formDataToSave.clienteId) {
      toast.error('É necessário selecionar um cliente');
      return;
    }

    if (formData.users.length > 0) {
      formData.users.forEach((user) => {
        const notificationType =
          formData.status === 'CONCLUIDO'
            ? NotificationType.PROJETO_CONCLUIDO
            : isEditing
            ? NotificationType.PROJETO_ATUALIZADO
            : NotificationType.PROJETO_ATRIBUIDO;
        const notification = {
          type: notificationType,
          content: `${notificationType}: "${formData.designacao}"`,
          userId: user.id,
          projetoId: projeto?.id || 0,
          tarefaId: 0,
          relatedId: projeto?.id || 0,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        sendNotification(notification);
      });
    }

    onSave(formDataToSave);
    onHide();
  };

  const userOptions =
    users.content && Array.isArray(users.content)
      ? users.content.map((user) => ({
          value: user.id,
          label: user.name,
        }))
      : [];

  const selectedUserOptions = formData.users
    ? formData.users.map((user) => ({
        value: user.id,
        label: user.name,
      }))
    : [];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Projeto' : 'Registar novo Projeto'}
          {clienteInfo && (
            <span className="ms-2 text-muted fs-6">
              para {clienteInfo.name}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form noValidate validated={validated}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formProjetoAno">
                <Form.Label>Ano</Form.Label>
                <Form.Control
                  type="number"
                  name="projetoAno"
                  value={formData.projetoAno}
                  onChange={handleInputChange}
                  min={2020}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, insira um ano válido.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDesignacao">
                <Form.Label>Designação</Form.Label>
                <Form.Control
                  type="text"
                  name="designacao"
                  value={formData.designacao}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, insira a designação do projeto.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formEntidade">
                <Form.Label>Entidade</Form.Label>
                <Form.Control
                  type="text"
                  name="entidade"
                  value={formData.entidade}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, insira a entidade.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formPrioridade">
                <Form.Label>Prioridade</Form.Label>
                <Form.Select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione a prioridade</option>
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione a prioridade.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="formObservacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observacao"
              value={formData.observacao}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPrazo">
                <Form.Label>Prazo</Form.Label>
                <Form.Control
                  type="date"
                  name="prazo"
                  value={formData.prazo}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o prazo.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="EM_PROGRESSO">Em Progresso</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="SUSPENSO">Suspenso</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o status.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formCoordenador">
                <Form.Label>Coordenador</Form.Label>
                <Form.Select
                  name="coordenadorId"
                  value={formData.coordenadorId || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione o coordenador</option>
                  {users.content &&
                    Array.isArray(users.content) &&
                    users.content.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formDataProposta">
                <Form.Label>Data da Proposta</Form.Label>
                <Form.Control
                  type="date"
                  name="dataProposta"
                  value={formData.dataProposta || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDataAdjudicacao">
                <Form.Label>Data da Adjudicação</Form.Label>
                <Form.Control
                  type="date"
                  name="dataAdjudicacao"
                  value={formData.dataAdjudicacao || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formTipo">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={formData.tipo || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="ASSESSORIA">Assessoria</option>
                  <option value="CONSULTORIA">Consultoria</option>
                  <option value="FISCALIZACAO">Fiscalização</option>
                  <option value="LEVANTAMENTO">Levantamento</option>
                  <option value="PROJETO">Projeto</option>
                  <option value="REVISAO">Revisão</option>
                  <option value="VISTORIA">Vistoria</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o tipo.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formCliente">
                <Form.Label>Cliente</Form.Label>
                <ClienteSelect
                  selectedClienteId={formData.clienteId}
                  onChange={(clienteId) => {
                    setFormData((prev) => ({ ...prev, clienteId }));
                  }}
                  required={!clienteInfo}
                  placeholder="Selecione o cliente..."
                  isDisabled={!!clienteInfo}
                />
                {validated && !formData.clienteId && !clienteInfo && (
                  <div className="text-danger small mt-1">
                    Por favor, selecione o cliente.
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-4" controlId="formUsers">
            <Form.Label>Colaboradores</Form.Label>
            <Select
              isMulti
              name="users"
              options={userOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedUserOptions}
              onChange={handleUserSelect}
              placeholder="Selecione os colaboradores..."
            />
            {validated && formData.users.length === 0 && (
              <div className="text-danger small mt-1">
                Selecione pelo menos um colaborador.
              </div>
            )}
          </Form.Group>

          {/* Colaboradores Externos - usando o novo componente */}
          <Form.Group className="mb-4" controlId="formExternos">
            <Form.Label>Colaboradores Externos</Form.Label>
            <ExternosSelect
              allExternos={externos}
              selectedExternos={formData.externos || []}
              onChange={handleExternoChange}
              isDisabled={isLoadingExternos}
              placeholder="Selecione os colaboradores externos..."
              showToastOnDuplicate={true}
              className="basic-multi-select"
            />
            <Form.Text className="text-muted">
              Opcional. Você poderá adicionar ou remover colaboradores externos
              após a criação do projeto.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Atualizar' : 'Registar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjetoModal;

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { User } from 'types/user';
import { getUsersAPI } from '../../api/requestsApi';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';
import Select from 'react-select';
import './ProjetoModal.scss';

interface ProjetoModalProps {
  show: boolean;
  onHide: () => void;
  projeto?: Projeto | null;
  onSave: (formData: ProjetoFormData) => void;
  isEditing: boolean;
}

const ProjetoModal: React.FC<ProjetoModalProps> = ({
  show,
  onHide,
  projeto,
  onSave,
  isEditing,
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
    status: 'ATIVO',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsersAPI();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Não foi possível carregar a lista de colaboradores.');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        projetoAno: new Date().getFullYear(),
        designacao: '',
        entidade: '',
        prioridade: '',
        observacao: '',
        prazo: '',
        users: [],
        status: 'ATIVO',
      });
      setValidated(false);
    }
  }, [isEditing, show]);

  useEffect(() => {
    if (isEditing && projeto) {
      const formattedPrazo = projeto.prazo
        ? new Date(projeto.prazo).toISOString().split('T')[0]
        : '';
      setFormData({
        ...projeto,
        prazo: formattedPrazo,
      });
      setValidated(false);
    }
  }, [projeto, isEditing, show]);

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
    /*
    const currentYear = new Date().getFullYear();
    if (formData.projetoAno < currentYear) {
      toast.error('O ano do projeto não pode ser anterior ao ano atual');
      return false;
    }
    */
    if (formData.prazo) {
      const prazoDate = new Date(formData.prazo);
      if (prazoDate < new Date()) {
        toast.error('O prazo não pode ser anterior à data atual');
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    setValidated(true);
    if (!validateForm()) return;

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
    onSave(formData);
    onHide();
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: user.name,
  }));

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

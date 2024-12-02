import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { User } from 'types/user';
import { getUsersAPI } from '../../api/requestsApi';
import { useNotification } from '../../NotificationContext';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    const fetchUsers = async () => {
      const usersData = await getUsersAPI();
      setUsers(usersData);
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
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && projeto) {
      const formattedPrazo = projeto.prazo
        ? new Date(projeto.prazo).toISOString().split('T')[0]
        : '';

      setFormData({
        ...projeto,
        prazo: formattedPrazo,
      });
    }
  }, [projeto, isEditing]);

  const handleUserSelect = (user: User) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      users: [...prevFormData.users, user],
    }));
  };

  const handleUserDeselect = (userId: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      users: prevFormData.users.filter((user) => user.id !== userId),
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

    const currentYear = new Date().getFullYear();
    if (formData.projetoAno < currentYear) {
      toast.error('O ano do projeto não pode ser anterior ao ano atual');
      return false;
    }

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

    toast.success(
      isEditing
        ? 'Projeto atualizado com sucesso!'
        : 'Novo projeto criado com sucesso!'
    );
    onSave(formData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Projeto' : 'Registar novo Projeto'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formProjetoAno">
            <Form.Label>Ano</Form.Label>
            <Form.Control
              type="number"
              name="projetoAno"
              value={formData.projetoAno}
              onChange={handleInputChange}
              min={new Date().getFullYear()}
            />
          </Form.Group>

          <Form.Group controlId="formDesignacao">
            <Form.Label>Designação</Form.Label>
            <Form.Control
              type="text"
              name="designacao"
              value={formData.designacao}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formEntidade">
            <Form.Label>Entidade</Form.Label>
            <Form.Control
              type="text"
              name="entidade"
              value={formData.entidade}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPrioridade">
            <Form.Label>Prioridade</Form.Label>
            <Form.Select
              name="prioridade"
              value={formData.prioridade}
              onChange={handleInputChange}
            >
              <option value="">Selecione a prioridade</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formObservacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              name="observacao"
              value={formData.observacao}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formPrazo">
            <Form.Label>Prazo</Form.Label>
            <Form.Control
              type="date"
              name="prazo"
              value={formData.prazo}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>

          <Form.Group controlId="formStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ATIVO">Ativo</option>
              <option value="EM_PROGRESSO">Em Progresso</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="SUSPENSO">Suspenso</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formUsers">
            <Form.Label>Colaboradores</Form.Label>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <Form.Check
                  key={user.id}
                  type="checkbox"
                  label={user.name}
                  checked={formData.users.some(
                    (selectedUser) => selectedUser.id === user.id
                  )}
                  onChange={() =>
                    formData.users.some(
                      (selectedUser) => selectedUser.id === user.id
                    )
                      ? handleUserDeselect(user.id)
                      : handleUserSelect(user)
                  }
                />
              ))
            ) : (
              <p>No users available</p>
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

// src/components/Projeto/ProjetoModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { User } from 'types/user';
import { getUsersAPI } from '../../api/requestsApi';

/**
The formData state is initialized with the appropriate values based on whether the modal is for creating a new project (isEditing is false)
or editing an existing project (isEditing is true and projeto is not null).

The useEffect hook that sets the formData state with the projeto data is included, and it handles the formatting of the prazo property.

The helper functions handleUserSelect, handleUserDeselect, handleInputChange, and handleSave are included from the previous EditProjetoModal and AdicionarProjetoModal components.

The JSX code for rendering the form fields and modal structure is included, with the modal title and the "Salvar" button text conditionally rendered based on the isEditing prop.
 */

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
  const [formData, setFormData] = useState<ProjetoFormData>({
    projetoAno: 0,
    designacao: '',
    entidade: '',
    prioridade: '',
    observacao: '',
    prazo: '',
    users: [],
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
        projetoAno: 0,
        designacao: '',
        entidade: '',
        prioridade: '',
        observacao: '',
        prazo: '',
        users: [],
      });
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && projeto) {
      const formattedPrazo = projeto.prazo
        ? new Date(projeto.prazo).toISOString().split('T')[0]
        : '';

      const currentDate = new Date();
      const projetoDate = new Date(projeto.prazo);

      if (projetoDate.getFullYear() < currentDate.getFullYear()) {
        console.error('O ano do prazo não pode ser anterior ao ano atual');
        return;
      }

      setFormData({
        projetoAno: projeto.projetoAno,
        designacao: projeto.designacao,
        entidade: projeto.entidade,
        prioridade: projeto.prioridade,
        observacao: projeto.observacao,
        prazo: formattedPrazo,
        users: projeto.users,
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (formData.designacao.trim() === '' || formData.entidade.trim() === '') {
      console.error('Designação e Entidade são campos obrigatórios');
      return;
    }

    console.log('Form Data:', formData);

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
            />
          </Form.Group>

          <Form.Group controlId="formDesignacao">
            <Form.Label>Designação</Form.Label>
            <Form.Control
              type="text"
              name="designacao"
              value={formData.designacao}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formEntidade">
            <Form.Label>Entidade</Form.Label>
            <Form.Control
              type="text"
              name="entidade"
              value={formData.entidade}
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
            />
          </Form.Group>

          <Form.Group controlId="formUsers">
            <Form.Label>Colaboradores</Form.Label>
            {Array.isArray(users) ? (
              users.map((user) => (
                <Form.Check
                  key={user.id}
                  type="checkbox"
                  label={user.username}
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
          Registar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjetoModal;

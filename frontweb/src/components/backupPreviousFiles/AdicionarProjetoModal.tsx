import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { ProjetoFormData } from '../../types/projeto';
import { User } from 'types/user';
import { getUsersAPI } from 'api/requestsApi';

interface ModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (formData: ProjetoFormData) => void;
}

const AdicionarProjetoModal: React.FC<ModalProps> = ({
  show,
  onHide,
  onSave,
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

  /**
   * Adicionalmente temos que verificar que o ano do prazo, aquando a edição do projeto,
   * nunca é anterior à data atual
   * 
   * Ver a largura máxima de cada column e como se adaptam à nova info inserida
   */

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
        <Modal.Title>Registar novo Projeto</Modal.Title>
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
            {users.map((user) => (
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
            ))}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdicionarProjetoModal;

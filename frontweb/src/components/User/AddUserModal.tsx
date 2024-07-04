import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { createUserAPI } from 'api/requestsApi';

interface AddUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserCreated: (newUser: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  show,
  onHide,
  onUserCreated,
}) => {
  const [username, setUsername] = useState('');
  const [funcao, setFuncao] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    // Reset form data when the modal is opened or closed
    if (show) {
      setUsername('');
      setFuncao('');
      setCargo('');
      setEmail('');
      setPassword('');
      setProfileImage(null);
    }
  }, [show]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setPassword(e.target.value);
  }

  function handleFuncaoChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setFuncao(e.target.value);
  }

  function handleCargoChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setCargo(e.target.value);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setEmail(e.target.value);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProfileImage(file || null);
  };

  const handleSave = async () => {
    const userData = {
      username,
      funcao,
      cargo,
      email,
      password,
    };

    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (profileImage) {
      formData.append('image', profileImage);
    }

    try {
      const newUser = await createUserAPI(formData);
      onUserCreated(newUser);
      onHide();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Utilizador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formUsername">
            <Form.Label>Nome de Utilizador</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={handleUsernameChange}
            />
          </Form.Group>

          <Form.Group controlId="formUsername">
            <Form.Label>Função</Form.Label>
            <Form.Control
              type="text"
              value={funcao}
              onChange={handleFuncaoChange}
            />
          </Form.Group>

          <Form.Group controlId="formUsername">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              type="text"
              value={cargo}
              onChange={handleCargoChange}
            />
          </Form.Group>

          <Form.Group controlId="formUsername">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              value={email}
              onChange={handleEmailChange}
            />
          </Form.Group>

          <Form.Group controlId="formUsername">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </Form.Group>

          <Form.Group controlId="formProfileImage">
            <Form.Label>Imagem de Perfil</Form.Label>
            <Form.Control type="file" onChange={handleImageUpload} />
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

export default AddUserModal;

// AddUserModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { createUserAPI } from 'api/requestsApi';

interface AddUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserSaved: (savedUser: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  show,
  onHide,
  onUserSaved,
}) => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    name: '',
    funcao: '',
    cargo: '',
    email: '',
    password: '',
    profileImage: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    // Reset formData and profileImage when the modal is opened
    if (show) {
      setFormData({
        id: 0,
        name: '',
        funcao: '',
        cargo: '',
        email: '',
        password: '',
        profileImage: '',
      });
      setProfileImage(null);
    }
  }, [show]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProfileImage(file || null);
  };

  const handleSave = async () => {
    const formDataObj = new FormData();

    // Append all form data except profileImage
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'profileImage' && value !== undefined) {
        formDataObj.append(key, value.toString());
      }
    });

    // If a new profileImage is selected, append it to formDataObj
    if (profileImage) {
      formDataObj.append('image', profileImage);
    }

    try {
      const savedUser = await createUserAPI(formDataObj);
      onUserSaved(savedUser);
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
          <Form.Group controlId="formName">
            <Form.Label>Nome de Utilizador</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formFuncao">
            <Form.Label>Função</Form.Label>
            <Form.Control
              type="text"
              name="funcao"
              value={formData.funcao}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formCargo">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
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
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;

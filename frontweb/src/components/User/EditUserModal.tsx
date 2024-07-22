// EditUserModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { updateUserAPI } from 'api/requestsApi';

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user?: User | null;
  onUserSaved: (savedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  onHide,
  user,
  onUserSaved,
}) => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    username: '',
    funcao: '',
    cargo: '',
    email: '',
    password: '',
    profileImage: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      const formattedProfileImage = user.profileImage
        ? `data:image/jpeg;base64,${user.profileImage}`
        : '';

      setFormData({
        id: user.id,
        username: user.username,
        funcao: user.funcao,
        cargo: user.cargo,
        email: user.email,
        password: user.password,
        profileImage: formattedProfileImage || user.profileImage,
      });
      setProfileImage(null);
    }
  }, [user]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
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
    } else if (formData.profileImage) {
      // If no new profileImage is selected, convert the existing profileImage to a File object and append it
      const base64Data = formData.profileImage.split(',')[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const file = new File([bytes], 'existing-image.jpg', {
        type: 'image/jpeg',
      });
      formDataObj.append('image', file);
    }

    try {
      const savedUser = await updateUserAPI(formData.id, formDataObj);
      onUserSaved(savedUser);
      onHide();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Utilizador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formUsername">
            <Form.Label>Nome de Utilizador</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
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
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;

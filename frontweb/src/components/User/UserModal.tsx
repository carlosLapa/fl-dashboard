import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { createUserAPI, updateUserAPI } from 'api/requestsApi';

interface UserModalProps {
  show: boolean;
  onHide: () => void;
  user?: User | null;
  onUserSaved: (savedUser: User) => void;
  isEditing: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  show,
  onHide,
  user: userToEdit, 
  onUserSaved,
  isEditing,
}) => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    name: '',
    funcao: '',
    cargo: '',
    email: '',
    password: '',
    profileImage: '',
    //get: () => '', // Add a dummy 'get' property to satisfy the User type
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing && userToEdit) {
      const formattedProfileImage = userToEdit.profileImage
        ? `data:image/jpeg;base64,${userToEdit.profileImage}`
        : '';

      setFormData({
        id: userToEdit.id,
        name: userToEdit.name,
        funcao: userToEdit.funcao,
        cargo: userToEdit.cargo,
        email: userToEdit.email,
        password: userToEdit.password,
        profileImage: formattedProfileImage || userToEdit.profileImage,
        //get: () => '', // Add a dummy 'get' property to satisfy the User type
      });
    } else {
      setFormData({
        id: 0,
        name: '',
        funcao: '',
        cargo: '',
        email: '',
        password: '',
        profileImage: '', // Ver aqui!
        //get: () => '', // Add a dummy 'get' property to satisfy the User type
      });
      setProfileImage(null);
    }
  }, [isEditing, userToEdit]);

  useEffect(() => {
    return () => {
      setProfileImage(null);
    };
  }, []);

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
      if (key !== 'profileImage') {
        formDataObj.append(key, value.toString());
      }
    });

    // If a new profileImage is selected, append it to formDataObj
    if (profileImage) {
      formDataObj.append('image', profileImage);
    } else if (formData.profileImage) {
      // If no new profileImage is selected, append the existing profileImage
      formDataObj.append('image', formData.profileImage);
    }

    try {
      let savedUser;
      if (isEditing) {
        savedUser = await updateUserAPI(formData.id, formDataObj);
      } else {
        savedUser = await createUserAPI(formDataObj);
      }
      onUserSaved(savedUser);
      onHide();
    } catch (error) {
      console.error('Error updating/creating user:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Utilizador' : 'Adicionar Utilizador'}
        </Modal.Title>
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
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;

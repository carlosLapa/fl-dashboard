// AddUserModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { createUserAPI } from 'api/requestsApi';
import { EMAIL_REGEX } from 'utils/validation';

interface AddUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserSaved: (savedUser: User) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB, mirrors the backend limit

type FormErrors = Partial<Record<'name' | 'email' | 'password' | 'profileImage', string>>;

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
    ativo: true,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

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
        ativo: true,
      });
      setProfileImage(null);
      setErrors({});
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
    if (!file) {
      setProfileImage(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, profileImage: 'Ficheiro inválido. São permitidos JPEG e PNG' }));
      e.target.value = '';
      setProfileImage(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((prev) => ({ ...prev, profileImage: 'Tamanho do ficheiro excede o limite de 2MB' }));
      e.target.value = '';
      setProfileImage(null);
      return;
    }
    setErrors((prev) => ({ ...prev, profileImage: undefined }));
    setProfileImage(file);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Password é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
              maxLength={255}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formFuncao">
            <Form.Label>Função</Form.Label>
            <Form.Control
              type="text"
              name="funcao"
              value={formData.funcao}
              onChange={handleInputChange}
              maxLength={255}
            />
          </Form.Group>

          <Form.Group controlId="formCargo">
            <Form.Label>Cargo</Form.Label>
            <Form.Control
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              maxLength={255}
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              maxLength={255}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              maxLength={100}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formProfileImage">
            <Form.Label>Imagem de Perfil</Form.Label>
            <Form.Control
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              isInvalid={!!errors.profileImage}
            />
            <Form.Control.Feedback type="invalid">
              {errors.profileImage}
            </Form.Control.Feedback>
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

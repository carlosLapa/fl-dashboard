// EditUserModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { User } from 'types/user';
import { updateUserAPI } from 'api/requestsApi';
import { EMAIL_REGEX } from 'utils/validation';

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user?: User | null;
  onUserSaved: (savedUser: User) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB, mirrors the backend limit

type FormErrors = Partial<Record<'name' | 'email' | 'profileImage', string>>;

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  onHide,
  user,
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
    if (user) {
      const formattedProfileImage = user.profileImage
        ? `data:image/jpeg;base64,${user.profileImage}`
        : '';

      setFormData({
        id: user.id,
        name: user.name,
        funcao: user.funcao,
        cargo: user.cargo,
        email: user.email,
        // This modal never edits the password — never seed it from the API response.
        password: '',
        profileImage: formattedProfileImage || user.profileImage,
        ativo: user.ativo,
      });
      setProfileImage(null);
      setErrors({});
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const formDataObj = new FormData();

    // Explicit allowlist: this modal never edits password, so it must never be
    // re-sent — the backend treats any non-empty password field as a new password
    // to encode, and formData.password only ever held whatever was last fetched.
    formDataObj.append('name', formData.name);
    formDataObj.append('funcao', formData.funcao);
    formDataObj.append('cargo', formData.cargo);
    formDataObj.append('email', formData.email);
    formDataObj.append('ativo', String(formData.ativo));

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
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;

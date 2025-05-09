import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { User } from 'types/user';
import { createUserAPI, updateUserAPI } from 'api/requestsApi';
import './UserModal.scss';

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
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && userToEdit) {
      setFormData({
        id: userToEdit.id,
        name: userToEdit.name,
        funcao: userToEdit.funcao,
        cargo: userToEdit.cargo,
        email: userToEdit.email,
        password: '', // Don't show existing password
        profileImage: userToEdit.profileImage || '',
      });

      if (userToEdit.profileImage) {
        setImagePreview(`data:image/jpeg;base64,${userToEdit.profileImage}`);
      } else {
        setImagePreview(null);
      }
    } else {
      // Reset form for adding new user
      setFormData({
        id: 0,
        name: '',
        funcao: '',
        cargo: '',
        email: '',
        password: '',
        profileImage: '',
      });
      setImagePreview(null);
    }
    setProfileImage(null);
    setErrors({});
  }, [isEditing, userToEdit, show]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password é obrigatória para novos utilizadores';
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
        // Only include password if it's not empty or if we're creating a new user
        if (key !== 'password' || (value && value.toString().trim() !== '')) {
          formDataObj.append(key, value.toString());
        }
      }
    });

    // Handle profile image
    if (profileImage) {
      formDataObj.append('image', profileImage);
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
      setErrors({
        submit:
          'Ocorreu um erro ao guardar o utilizador. Por favor tente novamente.',
      });
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="user-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Utilizador' : 'Adicionar Utilizador'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={8}>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label>Nome de Utilizador*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="formFuncao" className="mb-3">
                    <Form.Label>Função</Form.Label>
                    <Form.Control
                      type="text"
                      name="funcao"
                      value={formData.funcao}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formCargo" className="mb-3">
                    <Form.Label>Cargo</Form.Label>
                    <Form.Control
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Only show password field for new users or with a note for existing users */}
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>
                  {isEditing
                    ? 'Password (deixe em branco para manter a atual)'
                    : 'Password*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="formProfileImage" className="mb-3">
                <Form.Label>Imagem de Perfil</Form.Label>
                <div className="profile-image-container mb-2">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="profile-image-preview"
                      roundedCircle
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span>Sem imagem</span>
                    </div>
                  )}
                </div>
                <Form.Control
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <Form.Text className="text-muted">
                  Selecione uma imagem para o perfil do utilizador
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {errors.submit && (
            <div className="alert alert-danger mt-3">{errors.submit}</div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Guardar' : 'Adicionar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;

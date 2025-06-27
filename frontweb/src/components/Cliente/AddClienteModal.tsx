import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ClienteDTO, ClienteInsertDTO } from 'types/cliente';
import { createClienteAPI } from 'api/clienteApi';

interface AddClienteModalProps {
  show: boolean;
  onHide: () => void;
  onClienteSaved: (savedCliente: ClienteDTO) => void;
}

const AddClienteModal: React.FC<AddClienteModalProps> = ({
  show,
  onHide,
  onClienteSaved,
}) => {
  const [formData, setFormData] = useState<ClienteInsertDTO>({
    name: '',
    morada: '',
    nif: '',
    contacto: '',
    responsavel: '',
    contactos: [],
    responsaveis: [],
    emails: [],
  });
  const [newContacto, setNewContacto] = useState('');
  const [newResponsavel, setNewResponsavel] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset formData when the modal is opened
    if (show) {
      setFormData({
        name: '',
        morada: '',
        nif: '',
        contacto: '',
        responsavel: '',
        contactos: [],
        responsaveis: [],
        emails: [],
      });
      setNewContacto('');
      setNewResponsavel('');
      setNewEmail('');
      setError(null);
    }
  }, [show]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleAddContacto = () => {
    if (newContacto.trim()) {
      // Don't add if it's the same as the main contact
      if (newContacto.trim() === formData.contacto) {
        setNewContacto('');
        return;
      }

      // Don't add if it already exists in the list
      if (formData.contactos.includes(newContacto.trim())) {
        setNewContacto('');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        contactos: [...prev.contactos, newContacto.trim()],
      }));
      setNewContacto('');
    }
  };

  const handleRemoveContacto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index),
    }));
  };

  const handleAddResponsavel = () => {
    if (newResponsavel.trim()) {
      // Don't add if it's the same as the main responsible
      if (newResponsavel.trim() === formData.responsavel) {
        setNewResponsavel('');
        return;
      }

      // Don't add if it already exists in the list
      if (formData.responsaveis.includes(newResponsavel.trim())) {
        setNewResponsavel('');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        responsaveis: [...prev.responsaveis, newResponsavel.trim()],
      }));
      setNewResponsavel('');
    }
  };

  const handleRemoveResponsavel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsaveis: prev.responsaveis.filter((_, i) => i !== index),
    }));
  };

  const handleAddEmail = () => {
    if (newEmail.trim()) {
      // Don't add if it already exists in the list
      if (formData.emails.includes(newEmail.trim())) {
        setNewEmail('');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        emails: [...prev.emails, newEmail.trim()],
      }));
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.morada || !formData.nif) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a copy of the form data to manipulate
      const dataToSend = { ...formData };

      // Ensure main contacto is included in contactos array
      if (dataToSend.contacto) {
        // If contactos doesn't include the main contacto, add it
        if (!dataToSend.contactos.includes(dataToSend.contacto)) {
          dataToSend.contactos = [dataToSend.contacto, ...dataToSend.contactos];
        }
      }

      // Ensure main responsavel is included in responsaveis array
      if (dataToSend.responsavel) {
        // If responsaveis doesn't include the main responsavel, add it
        if (!dataToSend.responsaveis.includes(dataToSend.responsavel)) {
          dataToSend.responsaveis = [
            dataToSend.responsavel,
            ...dataToSend.responsaveis,
          ];
        }
      }

      const savedCliente = await createClienteAPI(dataToSend);
      onClienteSaved(savedCliente);
      onHide();
    } catch (error) {
      console.error('Error creating cliente:', error);
      setError('Erro ao criar cliente. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <Form>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>
              Nome <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formMorada" className="mb-3">
            <Form.Label>
              Morada <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="morada"
              value={formData.morada}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formNIF" className="mb-3">
            <Form.Label>
              NIF <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="nif"
              value={formData.nif}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formContacto" className="mb-3">
            <Form.Label className="primary-field">
              Contacto Principal
            </Form.Label>
            <Form.Control
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              placeholder="Contacto principal (opcional)"
            />
            <Form.Text className="text-muted">
              Este contacto será adicionado à lista de contactos.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="formContactos" className="mb-3">
            <Form.Label>Contactos Adicionais</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={newContacto}
                onChange={(e) => setNewContacto(e.target.value)}
                placeholder="Adicionar contacto"
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddContacto())
                }
              />
              <Button variant="outline-secondary" onClick={handleAddContacto}>
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </InputGroup>
            <ListGroup className="mb-3">
              {formData.contactos.map((contacto, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  {contacto}
                  <Button
                    variant="link"
                    className="p-0 text-danger"
                    onClick={() => handleRemoveContacto(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </ListGroup.Item>
              ))}
              {formData.contactos.length === 0 && (
                <ListGroup.Item className="text-muted">
                  Nenhum contacto adicional
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
          <Form.Group controlId="formResponsavel" className="mb-3">
            <Form.Label className="primary-field">
              Responsável Principal
            </Form.Label>
            <Form.Control
              type="text"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleInputChange}
              placeholder="Responsável principal (opcional)"
            />
            <Form.Text className="text-muted">
              Este responsável será adicionado à lista de responsáveis.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="formResponsaveis" className="mb-3">
            <Form.Label>Responsáveis Adicionais</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="text"
                value={newResponsavel}
                onChange={(e) => setNewResponsavel(e.target.value)}
                placeholder="Adicionar responsável"
                onKeyPress={(e) =>
                  e.key === 'Enter' &&
                  (e.preventDefault(), handleAddResponsavel())
                }
              />
              <Button
                variant="outline-secondary"
                onClick={handleAddResponsavel}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </InputGroup>
            <ListGroup className="mb-3">
              {formData.responsaveis.map((responsavel, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  {responsavel}
                  <Button
                    variant="link"
                    className="p-0 text-danger"
                    onClick={() => handleRemoveResponsavel(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </ListGroup.Item>
              ))}
              {formData.responsaveis.length === 0 && (
                <ListGroup.Item className="text-muted">
                  Nenhum responsável adicional
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
          <Form.Group controlId="formEmails" className="mb-3">
            <Form.Label className="primary-field">Emails</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Adicionar email"
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddEmail())
                }
              />
              <Button variant="outline-secondary" onClick={handleAddEmail}>
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </InputGroup>
            <ListGroup className="mb-3">
              {formData.emails.map((email, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  {email}
                  <Button
                    variant="link"
                    className="p-0 text-danger"
                    onClick={() => handleRemoveEmail(index)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </ListGroup.Item>
              ))}
              {formData.emails.length === 0 && (
                <ListGroup.Item className="text-muted">
                  Nenhum email adicional
                </ListGroup.Item>
              )}
            </ListGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddClienteModal;

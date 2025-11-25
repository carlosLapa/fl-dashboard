import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ClienteDTO, ClienteUpdateDTO } from 'types/cliente';
import { updateClienteAPI } from 'api/clienteApi';
import { toast } from 'react-toastify';
import './clienteDetailsCard.scss';

interface EditClienteModalProps {
  show: boolean;
  onHide: () => void;
  cliente?: ClienteDTO | null;
  onClienteSaved: (savedCliente: ClienteDTO) => void;
}

const EditClienteModal: React.FC<EditClienteModalProps> = ({
  show,
  onHide,
  cliente,
  onClienteSaved,
}) => {
  const [formData, setFormData] = useState<ClienteUpdateDTO>({
    name: '',
    morada: '',
    nif: '',
    numero: 0, // Add numero field
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
    if (cliente) {
      // Initialize form data from cliente
      setFormData({
        name: cliente.name,
        morada: cliente.morada,
        nif: cliente.nif,
        numero: cliente.numero || 0, // Initialize numero from cliente
        contacto: cliente.contacto || '',
        responsavel: cliente.responsavel || '',
        // Filter out the main contact/responsible from the collections
        contactos: (cliente.contactos || []).filter(
          (c) => c !== cliente.contacto
        ),
        responsaveis: (cliente.responsaveis || []).filter(
          (r) => r !== cliente.responsavel
        ),
        emails: cliente.emails || [],
      });
      setNewContacto('');
      setNewResponsavel('');
      setNewEmail('');
      setError(null);
    }
  }, [cliente]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    // Special handling for numero field
    if (name === 'numero') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleAddContacto = () => {
    if (newContacto.trim()) {
      if (newContacto.trim() === formData.contacto) {
        setNewContacto('');
        return;
      }
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
      if (newResponsavel.trim() === formData.responsavel) {
        setNewResponsavel('');
        return;
      }
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
    if (!cliente) return;

    if (!formData.name || !formData.morada || !formData.nif) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    // Validate numero
    if (!formData.numero || formData.numero <= 0) {
      setError('Número deve ser um valor inteiro positivo.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSend = { ...formData };

      if (dataToSend.contacto) {
        if (!dataToSend.contactos.includes(dataToSend.contacto)) {
          dataToSend.contactos = [dataToSend.contacto, ...dataToSend.contactos];
        }
      }

      if (dataToSend.responsavel) {
        if (!dataToSend.responsaveis.includes(dataToSend.responsavel)) {
          dataToSend.responsaveis = [
            dataToSend.responsavel,
            ...dataToSend.responsaveis,
          ];
        }
      }

      const savedCliente = await updateClienteAPI(cliente.id, dataToSend);
      onClienteSaved(savedCliente);
      onHide();
      toast.success('Cliente atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating cliente:', error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const numeroError = errors.find(
          (err: any) => err.fieldName === 'numero'
        );
        if (numeroError) {
          setError(numeroError.message);
        } else {
          setError('Erro ao atualizar cliente. Por favor, tente novamente.');
        }
      } else {
        setError('Erro ao atualizar cliente. Por favor, tente novamente.');
      }

      toast.error('Erro ao atualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <Form>
          <Form.Group controlId="formNumero" className="mb-3">
            <Form.Label>
              Número <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="numero"
              value={formData.numero || ''}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Prevent decimal point, minus sign, and 'e'
                if (
                  e.key === '.' ||
                  e.key === '-' ||
                  e.key === 'e' ||
                  e.key === 'E' ||
                  e.key === '+'
                ) {
                  e.preventDefault();
                }
              }}
              min="1"
              step="1"
              required
              placeholder="Ex: 1234"
            />
            <Form.Text className="text-muted">
              Número único do cliente (apenas números inteiros positivos)
            </Form.Text>
          </Form.Group>

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
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditClienteModal;

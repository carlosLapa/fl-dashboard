import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
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
  });

  useEffect(() => {
    // Reset formData when the modal is opened
    if (show) {
      setFormData({
        name: '',
        morada: '',
        nif: '',
        contacto: '',
        responsavel: '',
      });
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

  const handleSave = async () => {
    try {
      const savedCliente = await createClienteAPI(formData);
      onClienteSaved(savedCliente);
      onHide();
    } catch (error) {
      console.error('Error creating cliente:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formMorada" className="mb-3">
            <Form.Label>Morada</Form.Label>
            <Form.Control
              type="text"
              name="morada"
              value={formData.morada}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formNIF" className="mb-3">
            <Form.Label>NIF</Form.Label>
            <Form.Control
              type="text"
              name="nif"
              value={formData.nif}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formContacto" className="mb-3">
            <Form.Label>Contacto</Form.Label>
            <Form.Control
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formResponsavel" className="mb-3">
            <Form.Label>Responsável</Form.Label>
            <Form.Control
              type="text"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleInputChange}
              required
            />
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

export default AddClienteModal;

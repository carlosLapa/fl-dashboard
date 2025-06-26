import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { ClienteDTO, ClienteUpdateDTO } from 'types/cliente';
import { updateClienteAPI } from 'api/clienteApi';
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
    contacto: '',
    responsavel: '',
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        name: cliente.name,
        morada: cliente.morada,
        nif: cliente.nif,
        contacto: cliente.contacto,
        responsavel: cliente.responsavel,
      });
    }
  }, [cliente]);

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
    if (!cliente) return;
    try {
      const savedCliente = await updateClienteAPI(cliente.id, formData);
      onClienteSaved(savedCliente);
      onHide();
    } catch (error) {
      console.error('Error updating cliente:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
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
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditClienteModal;

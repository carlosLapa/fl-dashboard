import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import {
  ExternoDTO,
  ExternoInsertDTO,
  EspecialidadesExterno,
  FaseProjeto,
} from 'types/externo';
import { createExternoAPI } from 'api/externoApi';
import Select, { MultiValue } from 'react-select';

interface AddExternoModalProps {
  show: boolean;
  onHide: () => void;
  onExternoSaved: (savedExterno: ExternoDTO) => void;
}

// Define the option type for react-select
interface EspecialidadeOption {
  value: EspecialidadesExterno;
  label: string;
}

const AddExternoModal: React.FC<AddExternoModalProps> = ({
  show,
  onHide,
  onExternoSaved,
}) => {
  const [formData, setFormData] = useState<ExternoInsertDTO>({
    name: '',
    email: '',
    telemovel: '',
    preco: 0,
    faseProjeto: 'LICENCIAMENTO', // Default value
    especialidades: [],
  });

  useEffect(() => {
    // Reset formData when the modal is opened
    if (show) {
      setFormData({
        name: '',
        email: '',
        telemovel: '',
        preco: 0,
        faseProjeto: 'LICENCIAMENTO',
        especialidades: [],
      });
    }
  }, [show]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    if (name === 'preco') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: parseFloat(value) || 0,
      }));
    } else if (name === 'faseProjeto') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value as FaseProjeto,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleEspecialidadesChange = (
    selectedOptions: MultiValue<EspecialidadeOption>
  ) => {
    const selectedEspecialidades = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    setFormData((prevFormData) => ({
      ...prevFormData,
      especialidades: selectedEspecialidades,
    }));
  };

  const handleSave = async () => {
    try {
      const savedExterno = await createExternoAPI(formData);
      onExternoSaved(savedExterno);
      onHide();
    } catch (error) {
      console.error('Error creating externo:', error);
    }
  };

  const especialidadesOptions: EspecialidadeOption[] = [
    { value: 'ACUSTICA', label: 'Acústica' },
    { value: 'ARQUEOLOGIA', label: 'Arqueologia' },
    { value: 'ARQUITETURA', label: 'Arquitetura' },
    { value: 'AVAC', label: 'AVAC' },
    { value: 'ESTABILIDADE', label: 'Estabilidade' },
    { value: 'ELETRICA', label: 'Elétrica' },
    { value: 'ITED', label: 'ITED' },
    { value: 'REDES_AGUAS', label: 'Redes de Águas' },
    { value: 'REDES_ESGOTOS', label: 'Redes de Esgotos' },
    { value: 'REDES_PLUVIAIS', label: 'Redes Pluviais' },
    {
      value: 'SEGURANCA_CONTRA_INCENDIOS',
      label: 'Segurança Contra Incêndios',
    },
    { value: 'TERMICA', label: 'Térmica' },
  ];

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Colaborador Externo</Modal.Title>
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

          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTelemovel" className="mb-3">
            <Form.Label>Telemóvel</Form.Label>
            <Form.Control
              type="text"
              name="telemovel"
              value={formData.telemovel}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="formPreco" className="mb-3">
            <Form.Label>Preço (€/hora)</Form.Label>
            <Form.Control
              type="number"
              name="preco"
              value={formData.preco}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group controlId="formFaseProjeto" className="mb-3">
            <Form.Label>Fase do Projeto</Form.Label>
            <Form.Select
              name="faseProjeto"
              value={formData.faseProjeto}
              onChange={handleInputChange}
              required
            >
              <option value="LICENCIAMENTO">Licenciamento</option>
              <option value="EXECUCAO">Execução</option>
              <option value="COMUNICACAO_PREVIA">Comunicação Prévia</option>
              <option value="ASSISTENCIA_TECNICA">Assistência Técnica</option>
              <option value="PROGRAMA_BASE">Programa Base</option>
              <option value="ESTUDO_PREVIO">Estudo Prévio</option>
              <option value="PEDIDO_INFORMACAO_PREVIO">
                Pedido de Informação Prévio
              </option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formEspecialidades" className="mb-3">
            <Form.Label>Especialidades</Form.Label>
            <Select<EspecialidadeOption, true>
              isMulti
              name="especialidades"
              options={especialidadesOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleEspecialidadesChange}
              placeholder="Selecione as especialidades..."
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

export default AddExternoModal;

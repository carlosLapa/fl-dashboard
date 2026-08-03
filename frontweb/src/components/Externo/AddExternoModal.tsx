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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEMOVEL_REGEX = /^[\d\s+()-]{9,20}$/;

type FormErrors = Partial<Record<'name' | 'email' | 'telemovel' | 'preco', string>>;

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
  const [errors, setErrors] = useState<FormErrors>({});

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
      setErrors({});
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

    if (formData.telemovel && !TELEMOVEL_REGEX.test(formData.telemovel.trim())) {
      newErrors.telemovel = 'Telemóvel inválido';
    }

    if (formData.preco < 0) {
      newErrors.preco = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
    { value: 'INSPECOES', label: 'Inspeções' },
    { value: 'ARQUITETURA_PAISAGISTICA', label: 'Arquitetura Paisagística' },
  ];

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
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
              maxLength={255}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              maxLength={255}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formTelemovel" className="mb-3">
            <Form.Label>Telemóvel</Form.Label>
            <Form.Control
              type="text"
              name="telemovel"
              value={formData.telemovel}
              onChange={handleInputChange}
              maxLength={20}
              isInvalid={!!errors.telemovel}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telemovel}
            </Form.Control.Feedback>
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
              isInvalid={!!errors.preco}
            />
            <Form.Control.Feedback type="invalid">
              {errors.preco}
            </Form.Control.Feedback>
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

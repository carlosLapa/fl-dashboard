import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Proposta, PropostaFormData } from '../../types/proposta';
import { Cliente } from '../../types/cliente';
import Select from 'react-select';
import { toast } from 'react-toastify';

interface PropostaModalProps {
  show: boolean;
  onHide: () => void;
  proposta?: Proposta | null;
  onSave: (formData: PropostaFormData) => void;
  isEditing: boolean;
  clientes: Cliente[];
}

const PropostaModal: React.FC<PropostaModalProps> = ({
  show,
  onHide,
  proposta,
  onSave,
  isEditing,
  clientes,
}) => {
  const [formData, setFormData] = useState<PropostaFormData>({
    propostaAno: new Date().getFullYear(),
    designacao: '',
    prioridade: '',
    observacao: '',
    prazo: '',
    status: 'ATIVO',
    dataProposta: '',
    dataAdjudicacao: '',
    tipo: undefined,
    clienteIds: [],
  });
  const [validated, setValidated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        propostaAno: new Date().getFullYear(),
        designacao: '',
        prioridade: '',
        observacao: '',
        prazo: '',
        status: 'ATIVO',
        dataProposta: '',
        dataAdjudicacao: '',
        tipo: undefined,
        clienteIds: [],
      });
      setValidated(false);
    }
  }, [isEditing, show]);

  // Função utilitária para garantir formato yyyy-mm-dd
  function toInputDate(dateStr?: string): string {
    if (!dateStr) return '';
    // Se já estiver no formato yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Se vier em formato dd/mm/yyyy ou d/m/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(
        2,
        '0'
      )}`;
    }
    // Tenta converter usando Date
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return '';
  }

  useEffect(() => {
    if (isEditing && proposta) {
      setFormData({
        propostaAno: proposta.propostaAno,
        designacao: proposta.designacao,
        prioridade: proposta.prioridade,
        observacao: proposta.observacao,
        prazo: toInputDate(proposta.prazo),
        status: proposta.status,
        dataProposta: toInputDate(proposta.dataProposta),
        dataAdjudicacao: toInputDate(proposta.dataAdjudicacao),
        tipo: proposta.tipo,
        clienteIds: proposta.clientes.map((c) => c.id),
      });
      setValidated(false);
    }
  }, [proposta, isEditing, show]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientesChange = (selectedOptions: any) => {
    setFormData((prev) => ({
      ...prev,
      clienteIds: selectedOptions
        ? selectedOptions.map((opt: any) => opt.value)
        : [],
    }));
  };

  const validateForm = (): boolean => {
    if (formData.designacao.trim() === '') {
      toast.error('Designação é obrigatória');
      return false;
    }
    if (formData.clienteIds.length === 0) {
      toast.error('Selecione pelo menos um cliente');
      return false;
    }
    if (formData.prazo) {
      const prazoDate = new Date(formData.prazo);
      if (prazoDate < new Date()) {
        toast.error('O prazo não pode ser anterior à data atual');
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    setValidated(true);
    if (!validateForm()) return;
    onSave(formData);
    onHide();
  };

  const clienteOptions = clientes.map((cliente) => ({
    value: cliente.id,
    label: cliente.name,
  }));

  const selectedClienteOptions = clienteOptions.filter((opt) =>
    formData.clienteIds.includes(opt.value)
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Editar Proposta' : 'Registar nova Proposta'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form noValidate validated={validated}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPropostaAno">
                <Form.Label>Ano</Form.Label>
                <Form.Control
                  type="number"
                  name="propostaAno"
                  value={formData.propostaAno}
                  onChange={handleInputChange}
                  min={2020}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, insira um ano válido.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDesignacao">
                <Form.Label>Designação</Form.Label>
                <Form.Control
                  type="text"
                  name="designacao"
                  value={formData.designacao}
                  onChange={handleInputChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, insira a designação da proposta.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPrioridade">
                <Form.Label>Prioridade</Form.Label>
                <Form.Select
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione a prioridade</option>
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione a prioridade.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="ADJUDICADA">Adjudicada</option>
                  <option value="RECUSADA">Recusada</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o status.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="formObservacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observacao"
              value={formData.observacao}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formPrazo">
                <Form.Label>Prazo</Form.Label>
                <Form.Control
                  type="date"
                  name="prazo"
                  value={formData.prazo}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o prazo.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTipo">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={formData.tipo || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="ASSESSORIA">Assessoria</option>
                  <option value="CONSULTORIA">Consultoria</option>
                  <option value="FISCALIZACAO">Fiscalização</option>
                  <option value="LEVANTAMENTO">Levantamento</option>
                  <option value="PROJETO">Projeto</option>
                  <option value="REVISAO">Revisão</option>
                  <option value="VISTORIA">Vistoria</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione o tipo.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          {/* Datas da Proposta e Adjudicação - igual ao ProjetoModal */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formDataProposta">
                <Form.Label>Data da Proposta</Form.Label>
                <Form.Control
                  type="date"
                  name="dataProposta"
                  value={formData.dataProposta || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDataAdjudicacao">
                <Form.Label>Data da Adjudicação</Form.Label>
                <Form.Control
                  type="date"
                  name="dataAdjudicacao"
                  value={formData.dataAdjudicacao || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-4" controlId="formClientes">
            <Form.Label>Clientes</Form.Label>
            <Select
              isMulti
              name="clientes"
              options={clienteOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedClienteOptions}
              onChange={handleClientesChange}
              placeholder="Selecione os clientes..."
            />
            {validated && formData.clienteIds.length === 0 && (
              <div className="text-danger small mt-1">
                Selecione pelo menos um cliente.
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {isEditing ? 'Atualizar' : 'Registar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PropostaModal;

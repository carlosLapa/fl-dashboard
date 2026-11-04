import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ProjetoFase, ProjetoFaseFormData } from 'types/projetoFase';
import { validarFase } from 'services/projetoFaseService';

interface ProjetoFaseModalProps {
  show: boolean;
  onHide: () => void;
  // Rejects with the backend's message on failure; the modal stays open then.
  onSave: (data: ProjetoFaseFormData) => Promise<void>;
  fase?: ProjetoFase | null;
  // Projeto deadline ('yyyy-MM-dd...'), only used for a non-blocking hint.
  prazoProjeto?: string;
}

const vazio: ProjetoFaseFormData = {
  nome: '',
  descricao: '',
  dataInicio: '',
  dataFim: '',
};

const ProjetoFaseModal: React.FC<ProjetoFaseModalProps> = ({
  show,
  onHide,
  onSave,
  fase,
  prazoProjeto,
}) => {
  const [formData, setFormData] = useState<ProjetoFaseFormData>(vazio);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    setFormData(
      fase
        ? {
            nome: fase.nome,
            descricao: fase.descricao ?? '',
            dataInicio: fase.dataInicio ?? '',
            dataFim: fase.dataFim ?? '',
          }
        : vazio,
    );
  }, [show, fase]);

  const prazo = prazoProjeto?.split('T')[0];
  const ultrapassaPrazo = !!(prazo && formData.dataFim && formData.dataFim > prazo);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const erro = validarFase(formData);
    if (erro) {
      toast.warning(erro);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao gravar a fase');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{fase ? 'Editar Fase' : 'Nova Fase'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Form.Group controlId="faseNome" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              maxLength={100}
              placeholder="Ex.: Design Freeze"
              autoFocus
            />
          </Form.Group>
          <Form.Group controlId="faseDescricao" className="mb-3">
            <Form.Label>Descrição (opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descricao"
              value={formData.descricao ?? ''}
              onChange={handleChange}
              maxLength={255}
            />
          </Form.Group>
          <Row>
            <Col xs={12} sm={6}>
              <Form.Group controlId="faseDataInicio" className="mb-3">
                <Form.Label>Início</Form.Label>
                <Form.Control
                  type="date"
                  name="dataInicio"
                  value={formData.dataInicio ?? ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group controlId="faseDataFim" className="mb-3">
                <Form.Label>Fim</Form.Label>
                <Form.Control
                  type="date"
                  name="dataFim"
                  value={formData.dataFim ?? ''}
                  min={formData.dataInicio || undefined}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Text muted>
            As datas são opcionais e podem ser definidas mais tarde.
          </Form.Text>
          {ultrapassaPrazo && (
            <div className="text-warning small mt-2">
              A data de fim ultrapassa o prazo do projeto.
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'A gravar...' : 'Gravar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProjetoFaseModal;

import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Equipamento, EquipamentoFormData } from 'types/equipamento';

interface EquipamentoModalProps {
  show: boolean;
  equipamento: Equipamento | null;
  onHide: () => void;
  onSave: (data: EquipamentoFormData) => Promise<void>;
}

const EquipamentoModal: React.FC<EquipamentoModalProps> = ({
  show,
  equipamento,
  onHide,
  onSave,
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNome(equipamento?.nome ?? '');
    setDescricao(equipamento?.descricao ?? '');
  }, [equipamento, show]);

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.warning('Por favor, indique o nome do equipamento');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ nome: nome.trim(), descricao: descricao.trim() });
      onHide();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao guardar o equipamento',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formEquipamentoNome" className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            maxLength={100}
            placeholder="Ex.: Câmara 360, iPad 1, Carrinha"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Form.Text className="text-muted">
            Crie um registo por cada unidade física (ex.: iPad 1 e iPad 2), para
            que os conflitos sejam detetados corretamente.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="formEquipamentoDescricao" className="mb-3">
          <Form.Label>Descrição (opcional)</Form.Label>
          <Form.Control
            type="text"
            maxLength={255}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {equipamento ? 'Atualizar' : 'Criar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EquipamentoModal;

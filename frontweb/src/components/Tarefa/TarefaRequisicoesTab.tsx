import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { getEquipamentos } from 'services/equipamentoService';
import {
  Equipamento,
  RequisicaoEquipamento,
  RequisicaoEquipamentoDetalhe,
} from 'types/equipamento';

interface TarefaRequisicoesTabProps {
  requisicoes: RequisicaoEquipamento[];
  conflitos: Record<number, RequisicaoEquipamentoDetalhe[]>;
  // Used to pre-fill the period of a new requisição.
  prazoEstimado: string;
  prazoReal: string;
  onChange: (requisicoes: RequisicaoEquipamento[]) => void;
}

const formatDia = (dia: string) => format(parseISO(dia), 'dd/MM/yyyy');

const TarefaRequisicoesTab: React.FC<TarefaRequisicoesTabProps> = ({
  requisicoes,
  conflitos,
  prazoEstimado,
  prazoReal,
  onChange,
}) => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  useEffect(() => {
    getEquipamentos()
      .then(setEquipamentos)
      .catch(() => toast.error('Erro ao carregar os equipamentos'));
  }, []);

  const handleAdd = () => {
    onChange([
      ...requisicoes,
      { equipamentoId: 0, dataInicio: prazoEstimado, dataFim: prazoReal },
    ]);
  };

  const handleChange = (
    index: number,
    changes: Partial<RequisicaoEquipamento>,
  ) => {
    onChange(
      requisicoes.map((requisicao, i) =>
        i === index ? { ...requisicao, ...changes } : requisicao,
      ),
    );
  };

  const handleRemove = (index: number) => {
    onChange(requisicoes.filter((_, i) => i !== index));
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Requisição de material</Form.Label>
      <Form.Text className="d-block text-muted mb-2">
        Indique o material necessário e os dias em que vai ser usado. Se já
        estiver requisitado nesses dias, é apresentado um aviso, mas pode
        guardar na mesma e combinar com os colegas.
      </Form.Text>
      {requisicoes.map((requisicao, index) => {
        const conflitosLinha = conflitos[index] || [];
        // A deactivated equipamento leaves the catalogue list, but a requisição
        // made before that must still show what it refers to.
        const foraDaLista =
          requisicao.equipamentoId > 0 &&
          !equipamentos.some((e) => e.id === requisicao.equipamentoId);
        return (
          <div
            key={requisicao.id ?? `new-${index}`}
            className="border rounded p-2 mb-2"
          >
            <Row className="align-items-end">
              <Col xs={12} md={4} className="mb-2">
                <Form.Label className="mb-1">Equipamento</Form.Label>
                <Form.Select
                  aria-label="Equipamento"
                  value={requisicao.equipamentoId || ''}
                  onChange={(e) =>
                    handleChange(index, {
                      equipamentoId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Selecionar...</option>
                  {foraDaLista && (
                    <option value={requisicao.equipamentoId}>
                      {requisicao.equipamentoNome ?? requisicao.equipamentoId}
                      {requisicao.equipamentoAtivo === false
                        ? ' (Desativado)'
                        : ''}
                    </option>
                  )}
                  {equipamentos.map((equipamento) => (
                    <option key={equipamento.id} value={equipamento.id}>
                      {equipamento.nome}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3} className="mb-2">
                <Form.Label className="mb-1">De</Form.Label>
                <Form.Control
                  type="date"
                  aria-label="Data de início da requisição"
                  value={requisicao.dataInicio}
                  onChange={(e) =>
                    handleChange(index, { dataInicio: e.target.value })
                  }
                />
              </Col>
              <Col xs={6} md={3} className="mb-2">
                <Form.Label className="mb-1">Até</Form.Label>
                <Form.Control
                  type="date"
                  aria-label="Data de fim da requisição"
                  value={requisicao.dataFim}
                  min={requisicao.dataInicio || undefined}
                  onChange={(e) =>
                    handleChange(index, { dataFim: e.target.value })
                  }
                />
              </Col>
              <Col xs={12} md={2} className="mb-2 text-end">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleRemove(index)}
                >
                  Remover
                </Button>
              </Col>
            </Row>
            <Form.Control
              type="text"
              aria-label="Observações da requisição"
              placeholder="Observações (opcional)"
              maxLength={255}
              value={requisicao.observacoes || ''}
              onChange={(e) =>
                handleChange(index, { observacoes: e.target.value })
              }
            />
            {conflitosLinha.length > 0 && (
              <Alert variant="warning" className="mt-2 mb-0 py-2">
                <strong>Já requisitado nestes dias:</strong>
                <ul className="mb-0 ps-3">
                  {conflitosLinha.map((conflito) => (
                    <li key={conflito.id}>
                      {formatDia(conflito.dataInicio)} a{' '}
                      {formatDia(conflito.dataFim)} — tarefa "
                      {conflito.tarefaDescricao}"
                      {conflito.projetoDesignacao
                        ? ` (${conflito.projetoDesignacao})`
                        : ''}
                      {conflito.colaboradores.length > 0
                        ? ` — ${conflito.colaboradores.join(', ')}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
          </div>
        );
      })}
      <Button variant="outline-secondary" size="sm" onClick={handleAdd}>
        Adicionar material
      </Button>
    </Form.Group>
  );
};

export default TarefaRequisicoesTab;

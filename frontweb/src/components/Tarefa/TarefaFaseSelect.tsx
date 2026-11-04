import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ProjetoFase } from 'types/projetoFase';
import { formatarDataFase, getFasesByProjeto } from 'services/projetoFaseService';

interface TarefaFaseSelectProps {
  projetoId: number;
  // null = "sem fase"; undefined = the tarefa's phase is unknown on this screen.
  value: number | null | undefined;
  onChange: (faseId: number | null) => void;
}

// "Fase" dropdown shared by TarefaModal and ProjetoTarefaModal. Loads the selected
// projeto's phases itself, so it follows a projeto change inside the modal.
const TarefaFaseSelect: React.FC<TarefaFaseSelectProps> = ({
  projetoId,
  value,
  onChange,
}) => {
  const [fases, setFases] = useState<ProjetoFase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!projetoId) {
      setFases([]);
      return;
    }
    // Ignores a slow response for a projeto the user has already switched away from.
    let ativo = true;
    setIsLoading(true);
    getFasesByProjeto(projetoId)
      .then((data) => ativo && setFases(data))
      .catch(() => ativo && setFases([]))
      .finally(() => ativo && setIsLoading(false));
    return () => {
      ativo = false;
    };
  }, [projetoId]);

  if (!projetoId) {
    return null;
  }

  const descricaoPeriodo = (fase: ProjetoFase) =>
    fase.dataInicio || fase.dataFim
      ? ` (${formatarDataFase(fase.dataInicio)} – ${formatarDataFase(fase.dataFim)})`
      : '';

  return (
    <Form.Group controlId="formFase" className="mb-3">
      <Form.Label>Fase</Form.Label>
      <Form.Select
        value={value ?? ''}
        disabled={isLoading || fases.length === 0}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      >
        <option value="">
          {isLoading
            ? 'A carregar fases...'
            : fases.length === 0
              ? 'Este projeto ainda não tem fases'
              : 'Sem fase'}
        </option>
        {fases.map((fase) => (
          <option key={fase.id} value={fase.id}>
            {fase.nome}
            {descricaoPeriodo(fase)}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default TarefaFaseSelect;

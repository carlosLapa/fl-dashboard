import React, { useState, useEffect } from 'react';
import { Button, Card, ListGroup, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Externo, EspecialidadesExterno } from '../../types/externo';
import { getExternosByProjetoIdAPI } from '../../api/externoApi';
import {
  addExternosToProjeto,
  removeExternoFromProjeto,
  getAllExternos,
} from '../../services/externoService';
import ExternosSelect from '../ExternoSelect/ExternosSelect';

interface ProjetoExternosManagerProps {
  projetoId: number;
  onUpdate?: () => void;
}

const ProjetoExternosManager: React.FC<ProjetoExternosManagerProps> = ({
  projetoId,
  onUpdate,
}) => {
  const [externos, setExternos] = useState<Externo[]>([]);
  const [allExternos, setAllExternos] = useState<Externo[]>([]);
  const [selectedExternos, setSelectedExternos] = useState<Externo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadExternos = async () => {
    if (!projetoId) return;

    setIsLoading(true);
    try {
      const data = await getExternosByProjetoIdAPI(projetoId);
      setExternos(data);
    } catch (error) {
      console.error('Erro ao carregar colaboradores externos:', error);
      toast.error('Erro ao carregar colaboradores externos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllExternos = async () => {
    try {
      const data = await getAllExternos();
      setAllExternos(data);
    } catch (error) {
      console.error('Erro ao carregar todos os colaboradores externos:', error);
      toast.error('Erro ao carregar colaboradores externos');
    }
  };

  useEffect(() => {
    loadExternos();
    loadAllExternos();
  }, [projetoId]);

  const handleOpenModal = () => {
    setSelectedExternos([]);
    setShowModal(true);
  };

  const handleAddExternos = async () => {
    if (!selectedExternos.length) {
      toast.info('Selecione pelo menos um colaborador externo');
      return;
    }

    const externosIds = selectedExternos.map((e) => e.id);

    setIsModalLoading(true);
    try {
      await addExternosToProjeto(projetoId, externosIds);
      await loadExternos();
      setShowModal(false);
      toast.success('Colaboradores externos associados com sucesso!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erro ao associar colaboradores externos');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleRemoveExterno = async (externoId: number) => {
    if (
      window.confirm('Tem certeza que deseja remover este colaborador externo?')
    ) {
      setIsLoading(true);
      try {
        await removeExternoFromProjeto(projetoId, externoId);
        await loadExternos();
        toast.success('Colaborador externo removido com sucesso!');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error('Erro ao remover colaborador externo');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Função para formatar e exibir as especialidades de forma legível
  const formatEspecialidades = (especialidades?: EspecialidadesExterno[]) => {
    if (!especialidades || especialidades.length === 0) return '';

    // Substituir underscores por espaços e converter para formato mais legível
    return especialidades
      .map((esp) => {
        const formatted = esp.replace(/_/g, ' ').toLowerCase();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      })
      .join(', ');
  };

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Colaboradores Externos</h5>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenModal}
          disabled={isLoading}
        >
          Adicionar Colaboradores
        </Button>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-3">
            <Spinner
              animation="border"
              role="status"
              size="sm"
              className="me-2"
            />
            <span>Carregando colaboradores externos...</span>
          </div>
        ) : externos.length > 0 ? (
          <ListGroup>
            {externos.map((externo) => (
              <ListGroup.Item
                key={externo.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{externo.name}</strong>
                  <p className="mb-0 text-muted">{externo.email}</p>
                  {externo.especialidades &&
                    externo.especialidades.length > 0 && (
                      <small className="d-block text-secondary">
                        Especialidades:{' '}
                        {formatEspecialidades(externo.especialidades)}
                      </small>
                    )}
                  {externo.faseProjeto && (
                    <small className="d-block text-secondary">
                      Fase: {externo.faseProjeto.replace(/_/g, ' ')}
                    </small>
                  )}
                  {externo.preco && (
                    <small className="d-block text-secondary">
                      Preço:{' '}
                      {externo.preco.toLocaleString('pt-PT', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </small>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveExterno(externo.id)}
                >
                  Remover
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted text-center py-3">
            Nenhum colaborador externo associado a este projeto.
          </p>
        )}
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Colaboradores Externos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Selecione os colaboradores externos que deseja associar a este
            projeto:
          </p>
          <ExternosSelect
            allExternos={allExternos}
            selectedExternos={selectedExternos}
            onChange={setSelectedExternos}
            isDisabled={isModalLoading}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isModalLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddExternos}
            disabled={isModalLoading || selectedExternos.length === 0}
          >
            {isModalLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Adicionando...</span>
              </>
            ) : (
              'Adicionar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProjetoExternosManager;

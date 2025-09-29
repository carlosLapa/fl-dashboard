import React, { useState, useEffect, useCallback } from 'react';
import { Proposta, PropostaFormData } from '../../types/proposta';
import { getPropostas } from '../../services/propostaService';
import PropostaTable from '../../components/Proposta/PropostaTable';
import PropostaModal from '../../components/Proposta/PropostaModal';
import { Button } from 'react-bootstrap';
import {
  addPropostaAPI,
  updatePropostaAPI,
  deletePropostaAPI,
} from '../../api/propostaApi';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Cliente } from '../../types/cliente';
import { getAllClientes } from '../../services/clienteService';

const PropostasPage: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [propostaToEdit, setPropostaToEdit] = useState<Proposta | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Fetch clientes for the modal
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const allClientes = await getAllClientes();
        setClientes(allClientes);
      } catch (error) {
        toast.error('Erro ao carregar clientes');
      }
    };
    fetchClientes();
  }, []);

  // Fetch propostas
  const fetchPropostas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPropostas(page, pageSize);
      setPropostas(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Erro ao carregar propostas');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

  const handleAddNewProposta = () => {
    setPropostaToEdit(null);
    setShowModal(true);
  };

  const handleEditProposta = (proposta: Proposta) => {
    setPropostaToEdit(proposta);
    setShowModal(true);
  };

  const handleDeleteProposta = async (id: number) => {
    try {
      await deletePropostaAPI(id);
      await fetchPropostas();
      toast.success('Proposta excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir proposta');
    }
  };

  const handleAddOrUpdateProposta = async (formData: PropostaFormData) => {
    try {
      if (propostaToEdit) {
        await updatePropostaAPI(propostaToEdit.id, formData);
        toast.success('Proposta atualizada com sucesso');
      } else {
        await addPropostaAPI(formData);
        toast.success('Proposta criada com sucesso');
      }
      await fetchPropostas();
      setShowModal(false);
    } catch (error) {
      toast.error('Erro ao salvar proposta');
    }
  };

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      <div
        style={{
          width: '98%',
          marginLeft: '2%',
          marginRight: '2%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <h2 className="page-title">Gestão de Propostas</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddNewProposta}
              className="create-button"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Proposta
            </Button>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <PropostaTable
            propostas={propostas}
            onSelect={handleEditProposta}
            // Adapte para paginação se necessário
          />
        </div>
      </div>
      <PropostaModal
        show={showModal}
        onHide={() => setShowModal(false)}
        proposta={propostaToEdit}
        onSave={handleAddOrUpdateProposta}
        isEditing={!!propostaToEdit}
        clientes={clientes}
      />
    </div>
  );
};

export default PropostasPage;

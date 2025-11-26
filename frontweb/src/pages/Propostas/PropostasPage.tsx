/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Proposta, PropostaFormData } from '../../types/proposta';
import {
  getPropostas,
  converterParaProjeto,
} from '../../services/propostaService';
import { PropostaFilterState } from '../../types/filters';
import PropostaTable from '../../components/Proposta/PropostaTable';
import ProjetoModal from '../../components/Projeto/ProjetoModal';
import { ProjetoFormData } from '../../types/projeto';
import PropostaModal from '../../components/Proposta/PropostaModal';
import { Button } from 'react-bootstrap';
import { addProjetoAPI } from '../../api/requestsApi';
import { useNavigate } from 'react-router-dom';
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
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../permissions/rolePermissions';

const PropostasPage: React.FC = () => {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [propostaToEdit, setPropostaToEdit] = useState<Proposta | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showProjetoModal, setShowProjetoModal] = useState(false);
  const [projetoFormData, setProjetoFormData] =
    useState<ProjetoFormData | null>(null);

  // Estados de sorting APENAS para UI (visualização)
  const [sortField, setSortField] =
    useState<PropostaFilterState['sortField']>('propostaAno');
  const [sortDirection, setSortDirection] =
    useState<PropostaFilterState['sortDirection']>('desc');

  // Estados de sorting para backend (separados!)
  const [serverSortField, setServerSortField] =
    useState<PropostaFilterState['sortField']>('propostaAno');
  const [serverSortDirection, setServerSortDirection] =
    useState<PropostaFilterState['sortDirection']>('desc');

  const [filters, setFilters] = useState<PropostaFilterState>({
    search: '',
    clienteId: undefined,
    status: undefined,
    prioridade: undefined,
    sortField: 'propostaAno',
    sortDirection: 'desc',
  });

  // Função para converter Proposta em ProjetoFormData
  const mapPropostaToProjetoFormData = (
    proposta: Proposta
  ): ProjetoFormData => ({
    projetoAno: proposta.propostaAno,
    designacao: proposta.designacao,
    entidade: '', // Pode ser ajustado conforme necessário
    prioridade: proposta.prioridade,
    observacao: proposta.observacao,
    prazo: proposta.prazo || '',
    users: [],
    status: 'ATIVO',
    clienteId:
      proposta.clientes && proposta.clientes.length > 0
        ? proposta.clientes[0].id
        : undefined,
    coordenadorId: undefined,
    dataProposta: proposta.dataProposta || '',
    dataAdjudicacao: proposta.dataAdjudicacao || '',
    externos: [],
    externoIds: [],
    tipo: proposta.tipo,
  });

  // Handler para converter Proposta em Projeto diretamente
  const handleGenerateProjeto = async (proposta: Proposta) => {
    // Verificar permissão antes de tentar converter
    if (!hasPermission(Permission.ADJUDICAR_PROPOSTA)) {
      toast.error('Sem permissão para converter proposta em projeto');
      return;
    }

    try {
      const projetoCriado = await converterParaProjeto(proposta.id);
      toast.success('Projeto criado com sucesso!');
      // Atualiza a lista de propostas para refletir o novo projetoId
      await fetchPropostas();
      toast.info(
        'A proposta foi convertida em projeto e não pode ser convertida novamente.'
      );
      if (projetoCriado && projetoCriado.id) {
        navigate(`/projetos/${projetoCriado.id}/details`);
      }
    } catch (error) {
      toast.error('Erro ao converter proposta para projeto');
      console.error('Erro na conversão:', error);
    }
  };

  // Handler para criar Projeto manualmente (via modal)
  const handleSaveProjeto = async (formData: ProjetoFormData) => {
    try {
      const projetoCriado = await addProjetoAPI(formData);
      toast.success('Projeto criado com sucesso!');
      setShowProjetoModal(false);
      // Atualiza a lista de propostas para refletir o novo projetoId
      await fetchPropostas();
      toast.info(
        'A proposta foi convertida em projeto e não pode ser convertida novamente.'
      );
      if (projetoCriado && projetoCriado.id) {
        navigate(`/projetos/${projetoCriado.id}/details`);
      }
    } catch (error) {
      toast.error('Erro ao criar projeto');
    }
  };

  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

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
    console.log('🌐 Fetching propostas with:', {
      page,
      pageSize,
      serverSortField,
      serverSortDirection,
    });

    setIsLoading(true);
    try {
      const response = await getPropostas(
        page,
        pageSize,
        filters,
        serverSortField,
        serverSortDirection
      );
      setPropostas(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      // Após carregar do servidor, sincronizar estados de UI se não for clientes
      if (serverSortField !== 'clientes') {
        setSortField(serverSortField);
        setSortDirection(serverSortDirection);
      }
    } catch (error) {
      console.error('Error fetching propostas:', error);
      toast.error('Erro ao carregar propostas');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters, serverSortField, serverSortDirection]);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

  // Handler para mudança de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddNewProposta = () => {
    if (!hasPermission(Permission.CREATE_PROPOSTA)) {
      toast.error('Sem permissão para criar proposta');
      return;
    }
    setPropostaToEdit(null);
    setShowModal(true);
  };

  const handleEditProposta = (proposta: Proposta) => {
    if (!hasPermission(Permission.EDIT_PROPOSTA)) {
      toast.error('Sem permissão para editar proposta');
      return;
    }
    setPropostaToEdit(proposta);
    setShowModal(true);
  };

  const handleDeleteProposta = async (id: number) => {
    if (!hasPermission(Permission.DELETE_PROPOSTA)) {
      toast.error('Sem permissão para excluir proposta');
      return;
    }
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

  const handleSort = (field: string) => {
    console.log('🔍 handleSort called:', { field, sortField, sortDirection });

    // Ordenação client-side APENAS para coluna Cliente
    if (field === 'clientes') {
      console.log('✅ Client-side sorting para clientes');

      // Determinar nova direção
      let newDirection: 'asc' | 'desc' = 'asc';

      if (sortField === 'clientes') {
        newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        console.log('🔄 Toggling direction:', sortDirection, '→', newDirection);
      } else {
        console.log('🆕 First time sorting by clientes');
      }

      const sorted = [...propostas].sort((a, b) => {
        const nameA = a.clientes?.[0]?.name || '';
        const nameB = b.clientes?.[0]?.name || '';

        const comparison = nameA.localeCompare(nameB, 'pt-PT', {
          sensitivity: 'base',
        });

        return newDirection === 'asc' ? comparison : -comparison;
      });

      console.log(
        '📊 Sorted:',
        sorted.map((p) => p.clientes?.[0]?.name)
      );

      // Atualizar APENAS estados de UI (NÃO afeta fetchPropostas)
      setSortField('clientes');
      setSortDirection(newDirection);
      setPropostas(sorted);

      return; // IMPORTANTE: não alterar serverSortField/Direction
    }

    // Ordenação server-side para outros campos
    console.log('🌐 Server-side sorting for field:', field);

    const newDirection =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';

    // Atualizar estados de UI
    setSortField(field as PropostaFilterState['sortField']);
    setSortDirection(newDirection);

    // Atualizar estados de backend (isso vai disparar fetchPropostas)
    setServerSortField(field as PropostaFilterState['sortField']);
    setServerSortDirection(newDirection);

    setPage(0);
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
            {hasPermission(Permission.CREATE_PROPOSTA) && (
              <Button
                variant="primary"
                onClick={handleAddNewProposta}
                className="create-button"
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Adicionar Proposta
              </Button>
            )}
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <PropostaTable
            propostas={propostas}
            onSelect={handleEditProposta}
            onDeleteProposta={handleDeleteProposta}
            onGenerateProjeto={handleGenerateProjeto}
            page={page}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            isLoading={isLoading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {!isLoading && totalElements > 0 && (
            <div className="d-flex justify-content-center mt-3 text-muted">
              <small>
                Exibindo {Math.min(pageSize, propostas.length)} de{' '}
                {totalElements} propostas
              </small>
            </div>
          )}
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
      {/* Modal para criar Projeto a partir de Proposta */}
      <ProjetoModal
        show={showProjetoModal}
        onHide={() => setShowProjetoModal(false)}
        projeto={null}
        onSave={handleSaveProjeto}
        isEditing={false}
        clienteInfo={undefined}
        {...(projetoFormData ? { initialFormData: projetoFormData } : {})}
      />
    </div>
  );
};

export default PropostasPage;

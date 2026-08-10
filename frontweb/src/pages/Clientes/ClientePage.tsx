import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteTable from 'components/Cliente/ClienteTable';
import { getClientesPaged, fetchClientesWithFilters } from 'services/clienteService';
import { deleteClienteAPI, getClienteByIdAPI } from 'api/clienteApi';
import { ClienteDTO } from 'types/cliente';
import Button from 'react-bootstrap/Button';
import { Badge } from 'react-bootstrap';
import AddClienteModal from 'components/Cliente/AddClienteModal';
import EditClienteModal from 'components/Cliente/EditClienteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { usePermissions } from 'hooks/usePermissions';
import { useClienteFilters } from 'hooks/useFilterState';
import './clienteStyles.scss';

const ClientePage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clienteToEdit, setClienteToEdit] = useState<ClienteDTO | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<string>('numero');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const {
    filters,
    appliedFilters,
    isFiltered,
    updateFilter,
    applyFilters,
    clearFilters,
  } = useClienteFilters();

  const navigate = useNavigate();
  const { isEmployee } = usePermissions();

  const shouldDisableActions = isEmployee();

  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getClientesPaged(
        page,
        pageSize,
        sortField,
        sortDirection
      );
      setClientes(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortField, sortDirection]);

  const fetchFilteredClientes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchClientesWithFilters(
        appliedFilters,
        page,
        pageSize,
        sortField,
        sortDirection
      );
      setClientes(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching filtered clientes:', error);
      toast.error('Erro ao filtrar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, page, pageSize, sortField, sortDirection]);

  useEffect(() => {
    if (isFiltered) {
      fetchFilteredClientes();
    } else {
      fetchClientes();
    }
  }, [isFiltered, fetchFilteredClientes, fetchClientes]);

  const handleApplyFilters = useCallback(() => {
    const success = applyFilters();
    if (!success) {
      toast.warning('Por favor, preencha pelo menos um filtro para aplicar');
      return;
    }
    setPage(0);
  }, [applyFilters]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  const handleAddCliente = () => {
    if (shouldDisableActions) return;
    setShowAddModal(true);
  };

  const handleEditCliente = async (clienteId: number) => {
    if (shouldDisableActions) return;
    try {
      const fetchedCliente = await getClienteByIdAPI(clienteId);
      if (fetchedCliente) {
        setClienteToEdit(fetchedCliente);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
    }
  };

  const handleClienteSaved = async (savedCliente: ClienteDTO) => {
    if (shouldDisableActions) return;
    if (clienteToEdit) {
      setClientes(
        clientes.map((cliente) =>
          cliente.id === savedCliente.id ? savedCliente : cliente
        )
      );
    } else {
      setClientes([...clientes, savedCliente]);
    }
    if (isFiltered) {
      await fetchFilteredClientes();
    } else {
      await fetchClientes();
    }
    toast.success(
      clienteToEdit
        ? 'Cliente atualizado com sucesso!'
        : 'Cliente adicionado com sucesso!'
    );
  };

  const handleDeleteCliente = async (clienteId: number) => {
    if (shouldDisableActions) return;
    try {
      await deleteClienteAPI(clienteId);
      if (isFiltered) {
        await fetchFilteredClientes();
      } else {
        await fetchClientes();
      }
      toast.success('Cliente eliminado com sucesso!');
    } catch (error) {
      console.error('Error deleting cliente:', error);
      toast.error('Erro ao eliminar cliente');
    }
  };

  const handleViewProjetos = (clienteId: number) => {
    navigate(`/clientes/${clienteId}/projetos`);
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
        <div className="page-title-container">
          <h2 className="page-title">
            Clientes
            {isFiltered && (
              <Badge
                bg="info"
                className="ms-2"
                style={{ fontSize: '0.6em', verticalAlign: 'middle' }}
              >
                Filtros Aplicados
              </Badge>
            )}
          </h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddCliente}
              className="create-button"
              style={{
                position: 'relative',
                left: '20px',
                ...(shouldDisableActions ? disabledStyle : {}),
              }}
              disabled={shouldDisableActions}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Cliente
            </Button>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ClienteTable
            clientes={clientes}
            onEditCliente={handleEditCliente}
            onDeleteCliente={handleDeleteCliente}
            onViewProjetos={handleViewProjetos}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            filters={filters}
            updateFilter={updateFilter}
            onApplyFilters={handleApplyFilters}
            onClearFilters={clearFilters}
            isLoading={isLoading}
            shouldDisableActions={shouldDisableActions}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>
      <AddClienteModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onClienteSaved={handleClienteSaved}
      />
      <EditClienteModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setClienteToEdit(null);
        }}
        cliente={clienteToEdit}
        onClienteSaved={handleClienteSaved}
      />
    </div>
  );
};

export default ClientePage;

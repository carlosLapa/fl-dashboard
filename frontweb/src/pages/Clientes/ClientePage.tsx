import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClienteTable from 'components/Cliente/ClienteTable';
import { getClientesPaged } from 'services/clienteService';
import { deleteClienteAPI, getClienteByIdAPI } from 'api/clienteApi';
import { ClienteDTO } from 'types/cliente';
import Button from 'react-bootstrap/Button';
import AddClienteModal from 'components/Cliente/AddClienteModal';
import EditClienteModal from 'components/Cliente/EditClienteModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './clienteStyles.scss';

const ClientePage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clienteToEdit, setClienteToEdit] = useState<ClienteDTO | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const response = await getClientesPaged(page, pageSize);
      console.log('Clientes API response:', JSON.stringify(response));
      setClientes(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddCliente = () => {
    setShowAddModal(true);
  };

  const handleEditCliente = async (clienteId: number) => {
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
    if (clienteToEdit) {
      setClientes(
        clientes.map((cliente) =>
          cliente.id === savedCliente.id ? savedCliente : cliente
        )
      );
    } else {
      setClientes([...clientes, savedCliente]);
    }
    await fetchClientes(); // Refresh the paginated data
    toast.success(
      clienteToEdit
        ? 'Cliente atualizado com sucesso!'
        : 'Cliente adicionado com sucesso!'
    );
  };

  const handleDeleteCliente = async (clienteId: number) => {
    try {
      await deleteClienteAPI(clienteId);
      await fetchClientes(); // Refresh the paginated data
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
      {/* Wrap the title container and table in a div with consistent width and margins */}
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
          <h2 className="page-title">Clientes</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddCliente}
              className="create-button"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Cliente
            </Button>
          </div>
        </div>
        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ClienteTable
            clientes={clientes}
            onEditCliente={handleEditCliente}
            onDeleteCliente={handleDeleteCliente}
            onViewProjetos={handleViewProjetos}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            isLoading={isLoading}
          />
        </div>
      </div>
      {/* Modals */}
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

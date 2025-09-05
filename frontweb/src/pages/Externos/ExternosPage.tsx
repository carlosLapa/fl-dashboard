import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExternoTable from 'components/Externo/ExternoTable';
import { getExternos } from 'services/externoService';
import { deleteExternoAPI, getExternoByIdAPI } from 'api/externoApi';
import { ExternoDTO } from 'types/externo';
import Button from 'react-bootstrap/Button';
import AddExternoModal from 'components/Externo/AddExternoModal';
import EditExternoModal from 'components/Externo/EditExternoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { usePermissions } from 'hooks/usePermissions';
import './externosStyles.scss';

const ExternosPage: React.FC = () => {
  const [externos, setExternos] = useState<ExternoDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [externoToEdit, setExternoToEdit] = useState<ExternoDTO | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isEmployee } = usePermissions();

  // Check if user is an employee (not admin or manager)
  const shouldDisableActions = isEmployee();
  
  // Define disabled style for buttons/icons
  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const fetchExternos = async () => {
    setIsLoading(true);
    try {
      const response = await getExternos(page, pageSize);
      console.log('Externos API response:', JSON.stringify(response));
      setExternos(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching externos:', error);
      toast.error('Erro ao carregar colaboradores externos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExternos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddExterno = () => {
    if (shouldDisableActions) return;
    setShowAddModal(true);
  };

  const handleEditExterno = async (externoId: number) => {
    if (shouldDisableActions) return;
    try {
      const fetchedExterno = await getExternoByIdAPI(externoId);
      if (fetchedExterno) {
        setExternoToEdit(fetchedExterno);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching externo:', error);
      toast.error('Erro ao carregar dados do colaborador externo');
    }
  };

  const handleExternoSaved = async (savedExterno: ExternoDTO) => {
    if (externoToEdit) {
      setExternos(
        externos.map((externo) =>
          externo.id === savedExterno.id ? savedExterno : externo
        )
      );
    } else {
      setExternos([...externos, savedExterno]);
    }
    await fetchExternos(); // Refresh the paginated data
    toast.success(
      externoToEdit
        ? 'Colaborador externo atualizado com sucesso!'
        : 'Colaborador externo adicionado com sucesso!'
    );
  };

  const handleDeleteExterno = async (externoId: number) => {
    if (shouldDisableActions) return;
    try {
      await deleteExternoAPI(externoId);
      await fetchExternos(); // Refresh the paginated data
      toast.success('Colaborador externo eliminado com sucesso!');
    } catch (error) {
      console.error('Error deleting externo:', error);
      toast.error('Erro ao eliminar colaborador externo');
    }
  };

  const handleViewTasks = (externoId: number) => {
    navigate(`/externos/${externoId}/tarefas`);
  };

  const handleViewProjetos = (externoId: number) => {
    navigate(`/externos/${externoId}/projetos`);
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
          <h2 className="page-title">Colaboradores Externos</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddExterno}
              className="create-button"
              style={shouldDisableActions ? disabledStyle : {}}
              disabled={shouldDisableActions}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Colaborador Externo
            </Button>
          </div>
        </div>
        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ExternoTable
            externos={externos}
            onEditExterno={handleEditExterno}
            onDeleteExterno={handleDeleteExterno}
            onViewTasks={handleViewTasks}
            onViewProjetos={handleViewProjetos}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            isLoading={isLoading}
            shouldDisableActions={shouldDisableActions}
          />
        </div>
      </div>

      {/* Modals */}
      <AddExternoModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onExternoSaved={handleExternoSaved}
      />
      <EditExternoModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setExternoToEdit(null);
        }}
        externo={externoToEdit}
        onExternoSaved={handleExternoSaved}
      />
    </div>
  );
};

export default ExternosPage;

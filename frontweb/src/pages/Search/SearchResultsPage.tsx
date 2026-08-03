import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaUpdateFormData,
  TarefaStatus,
} from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import { User } from '../../types/user';
import { ClienteDTO } from '../../types/cliente';
import {
  searchTarefas,
  searchProjetos,
  searchUsers,
} from '../../services/searchService';
import { searchClientes } from '../../services/clienteService';
import {
  updateTarefa,
  updateTarefaStatus,
  calculateWorkingDays,
} from '../../services/tarefaService';
import { useNotification } from '../../hooks/useNotification';
import TarefaModal from '../../components/Tarefa/TarefaModal';
import { Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './styles.scss';

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{
    tarefas: TarefaWithUserAndProjetoDTO[];
    projetos: ProjetoWithUsersAndTarefasDTO[];
    users: User[];
    clientes: ClienteDTO[];
  }>({ tarefas: [], projetos: [], users: [], clientes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTarefaModal, setShowTarefaModal] = useState(false);
  const [tarefaToEdit, setTarefaToEdit] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);
  const { sendNotification } = useNotification();

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.all([
        searchTarefas(query),
        searchProjetos(query),
        searchUsers(query),
        searchClientes(query),
      ]);
      setResults({
        tarefas: results[0],
        projetos: results[1],
        users: results[2],
        clientes: results[3],
      });
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      toast.error('Search operation failed. Please try again later.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleEditTarefa = (tarefa: TarefaWithUserAndProjetoDTO) => {
    setTarefaToEdit(tarefa);
    setShowTarefaModal(true);
  };

  const handleUpdateTarefa = async (
    formData: TarefaUpdateFormData
  ) => {
    try {
      if (formData.prazoEstimado && formData.prazoReal) {
        formData = {
          ...formData,
          workingDays: calculateWorkingDays(
            formData.prazoEstimado,
            formData.prazoReal
          ),
        };
      }
      await updateTarefa(formData.id, formData, sendNotification);
      setShowTarefaModal(false);
      setTarefaToEdit(null);
      toast.success('Tarefa atualizada com sucesso!');
      await fetchSearchResults();
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      if (err instanceof Error && err.message.includes('prazo')) {
        toast.error(err.message);
      } else {
        toast.error('Erro ao atualizar tarefa');
        setShowTarefaModal(false);
      }
    }
  };

  const handleTarefaStatusChange = async (
    tarefaId: number,
    newStatus: TarefaStatus
  ) => {
    try {
      const tarefa = results.tarefas.find((t) => t.id === tarefaId);
      await updateTarefaStatus(tarefaId, newStatus, sendNotification, tarefa);
      toast.success('Status da tarefa atualizado com sucesso!');
      await fetchSearchResults();
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  if (error) {
    return (
      <div className="search-results-container">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-content">
        <Row className="mb-4 align-items-center">
          <Col xs={12} md={8}>
            <h2 className="fw-bold search-title">Resultados para "{query}"</h2>
          </Col>
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-md-end mt-2 mt-md-0"
          >
            <Button variant="btn btn-primary" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="d-flex justify-content-center mt-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">A carregar...</span>
            </div>
          </div>
        ) : (
          <>
            {results.users.length === 0 &&
            results.projetos.length === 0 &&
            results.tarefas.length === 0 &&
            results.clientes.length === 0 ? (
              <div className="alert alert-info mt-4">
                Não foram encontrados resultados
              </div>
            ) : (
              <div className="search-results-scrollable">
                <Row>
                  <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3 className="text-primary mb-3 section-title">
                      Colaboradores
                    </h3>
                    <div className="results-column">
                      {results.users.length > 0 ? (
                        results.users.map((user) => (
                          <div
                            key={user.id}
                            className="card mb-2 hover-shadow cursor-pointer search-card"
                            onClick={() =>
                              navigate(`/users/${user.id}/tarefas`)
                            }
                          >
                            <div className="card-body">
                              <h5 className="mb-2">{user.name}</h5>
                              <p className="text-muted mb-0">{user.email}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">
                          Colaborador(es) não encontrados
                        </p>
                      )}
                    </div>
                  </Col>

                  <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3 className="text-primary mb-3 section-title">
                      Projetos
                    </h3>
                    <div className="results-column">
                      {results.projetos.length > 0 ? (
                        results.projetos.map((projeto) => (
                          <div
                            key={projeto.id}
                            className="card mb-2 hover-shadow cursor-pointer search-card"
                            onClick={() =>
                              navigate(`/projetos/${projeto.id}/details`)
                            }
                          >
                            <div className="card-body">
                              <h5 className="mb-2">{projeto.designacao}</h5>
                              <p className="text-muted mb-0">
                                {projeto.entidade}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Projeto(s) não encontrados</p>
                      )}
                    </div>
                  </Col>

                  <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3 className="text-primary mb-3 section-title">Tarefas</h3>
                    <div className="results-column">
                      {results.tarefas.length > 0 ? (
                        results.tarefas.map((tarefa) => (
                          <div
                            key={tarefa.id}
                            className="card mb-2 hover-shadow cursor-pointer search-card"
                            onClick={() => handleEditTarefa(tarefa)}
                          >
                            <div className="card-body">
                              <h5 className="mb-2">{tarefa.descricao}</h5>
                              <p className="text-muted mb-0">
                                Projetos: {tarefa.projeto?.designacao}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">
                          Não foram encontradas tarefas
                        </p>
                      )}
                    </div>
                  </Col>

                  <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3 className="text-primary mb-3 section-title">
                      Clientes
                    </h3>
                    <div className="results-column">
                      {results.clientes.length > 0 ? (
                        results.clientes.map((cliente) => (
                          <div
                            key={cliente.id}
                            className="card mb-2 hover-shadow cursor-pointer search-card"
                            onClick={() =>
                              navigate(`/clientes/${cliente.id}/projetos`)
                            }
                          >
                            <div className="card-body">
                              <h5 className="mb-2">{cliente.name}</h5>
                              <p className="text-muted mb-0">{cliente.nif}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">
                          Cliente(s) não encontrados
                        </p>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </>
        )}
      </div>
      <TarefaModal
        show={showTarefaModal}
        onHide={() => {
          setShowTarefaModal(false);
          setTarefaToEdit(null);
        }}
        onSave={(formData) =>
          handleUpdateTarefa(formData as TarefaUpdateFormData)
        }
        onStatusChange={handleTarefaStatusChange}
        isEditing={true}
        tarefa={tarefaToEdit}
      />
    </div>
  );
};

export default SearchResults;

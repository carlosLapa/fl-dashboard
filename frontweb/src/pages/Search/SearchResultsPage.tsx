import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import { User } from '../../types/user';
import {
  searchTarefas,
  searchProjetos,
  searchUsers,
} from '../../services/searchService';
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
  }>({ tarefas: [], projetos: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await Promise.all([
          searchTarefas(query),
          searchProjetos(query),
          searchUsers(query),
        ]);
        setResults({
          tarefas: results[0],
          projetos: results[1],
          users: results[2],
        });
      } catch (err) {
        setError('Failed to fetch search results. Please try again.');
        toast.error('Search operation failed. Please try again later.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

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
            <h2 className="fw-bold search-title">
              Resultados para "{query}"
            </h2>
          </Col>
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-md-end mt-2 mt-md-0"
          >
            <Button variant="outline-primary" onClick={() => navigate(-1)}>
              Back
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
            results.tarefas.length === 0 ? (
              <div className="alert alert-info mt-4">
                Não foram encontrados resultados
              </div>
            ) : (
              <Row>
                <Col xs={12} lg={4} className="mb-4">
                  <h3 className="text-primary mb-3 section-title">
                    Colaboradores
                  </h3>
                  {results.users.length > 0 ? (
                    results.users.map((user) => (
                      <div
                        key={user.id}
                        className="card mb-2 hover-shadow cursor-pointer search-card"
                        onClick={() => navigate(`/users/${user.id}/tarefas`)}
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
                </Col>

                <Col xs={12} lg={4} className="mb-4">
                  <h3 className="text-primary mb-3 section-title">Projetos</h3>
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
                          <p className="text-muted mb-0">{projeto.entidade}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Projeto(s) não encontrados</p>
                  )}
                </Col>

                <Col xs={12} lg={4} className="mb-4">
                  <h3 className="text-primary mb-3 section-title">Tarefas</h3>
                  {results.tarefas.length > 0 ? (
                    results.tarefas.map((tarefa) => (
                      <div
                        key={tarefa.id}
                        className="card mb-2 hover-shadow cursor-pointer search-card"
                        onClick={() =>
                          navigate(`/projetos/${tarefa.projeto?.id}/full`)
                        }
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
                    <p className="text-muted">Não foram encontradas tarefas</p>
                  )}
                </Col>
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

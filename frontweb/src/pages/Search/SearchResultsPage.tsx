import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TarefaWithUsersAndProjetoDTO } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import { User } from '../../types/user';
import {
  searchTarefas,
  searchProjetos,
  searchUsers,
} from '../../services/searchService';
import { Button } from 'react-bootstrap';
import './styles.css';
import { toast } from 'react-toastify';

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{
    tarefas: TarefaWithUsersAndProjetoDTO[];
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
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 search-results-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Search Results for "{query}"</h2>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {results.users.length === 0 &&
          results.projetos.length === 0 &&
          results.tarefas.length === 0 ? (
            <div className="alert alert-info mt-4">
              No results found for your search. Try different keywords.
            </div>
          ) : (
            <>
              <div className="mt-4">
                <h3 className="text-primary mb-3">Users</h3>
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
                  <p className="text-muted">No users found</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-primary mb-3">Projects</h3>
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
                  <p className="text-muted">No projects found</p>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-primary mb-3">Tasks</h3>
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
                          Project: {tarefa.projeto?.designacao}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No tasks found</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;

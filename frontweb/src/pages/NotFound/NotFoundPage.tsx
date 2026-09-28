import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'AuthContext';
import 'assets/styles/layout.scss';

// Catch-all (`*`) route. Without it, an unknown URL rendered the layout with an empty
// content area, indistinguishable from a page that is still loading.
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-shell">
        <Alert variant="secondary">
          <Alert.Heading>Página Não Encontrada</Alert.Heading>
          <p className="mb-0">
            A página que procura não existe ou foi movida.
          </p>
          <hr />
          <Button
            variant="outline-secondary"
            onClick={() => navigate(`/users/${user?.id}/tarefas`)}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Ir para as Minhas Tarefas
          </Button>
        </Alert>
      </div>
    </div>
  );
};

export default NotFoundPage;

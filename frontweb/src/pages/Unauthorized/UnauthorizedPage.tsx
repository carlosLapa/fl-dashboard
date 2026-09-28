import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from 'AuthContext';
import 'assets/styles/layout.scss';

// Target of the `redirectTo` default in ProtectedRoute / PermissionProtectedRoute.
// Without a matching route the layout rendered with an empty content area.
const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="page-shell">
        <Alert variant="warning">
          <Alert.Heading>Acesso Não Autorizado</Alert.Heading>
          <p>Não tem permissões para aceder a esta página.</p>
          <p className="mb-0">
            Se necessitar de acesso, contacte um administrador.
          </p>
          <hr />
          {/* Fixed target rather than navigate(-1): the guards redirect with `replace`, and
              a directly-opened URL has no in-app history to go back to. */}
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

export default UnauthorizedPage;

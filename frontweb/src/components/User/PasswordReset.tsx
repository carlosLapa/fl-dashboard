import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  InputGroup,
} from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User } from '../../types/user';
import { getUsersAPI } from '../../api/requestsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId')
    ? Number(searchParams.get('userId'))
    : '';

  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>(
    initialUserId
  );
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetMode, setResetMode] = useState<'single' | 'all'>('single');
  const [error, setError] = useState<string>('');
  const [validated, setValidated] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersAPI();
        if (response && 'content' in response) {
          setUsers(response.content);
        } else if (Array.isArray(response)) {
          setUsers(response);
        }
      } catch (err) {
        console.error('Erro ao carregar colaboradores:', err);
        setError('Não foi possível carregar a lista de colaboradores');
      }
    };

    fetchUsers();

    if (initialUserId) {
      setResetMode('single');
    }
  }, [initialUserId]);

  const validateForm = (): boolean => {
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (resetMode === 'single' && !selectedUserId) {
      setError('Por favor, selecione um colaborador');
      return false;
    }

    setError('');
    return true;
  };

  const handleResetSinglePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidated(true);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post('/admin/reset-password', {
        userId: selectedUserId,
        newPassword: newPassword,
      });

      toast.success('Senha redefinida com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setSelectedUserId('');
      setValidated(false);
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      toast.error(err.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAllPasswords = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidated(true);
    if (!validateForm()) return;

    if (
      !window.confirm(
        'ATENÇÃO: Está prestes a redefinir a senha de TODOS os colaboradores. Esta ação não pode ser desfeita. Continuar?'
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axios.post('/admin/reset-all-passwords', {
        newPassword: newPassword,
      });

      toast.success('Todas as senhas foram redefinidas com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
      setValidated(false);
    } catch (err: any) {
      console.error('Erro ao redefinir senhas:', err);
      toast.error(err.response?.data?.message || 'Erro ao redefinir senhas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Gerenciamento de Senhas</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <span>Redefinição de Senha</span>
            <div>
              <Form.Check
                type="radio"
                inline
                label="Usuário específico"
                name="resetMode"
                id="resetModeSingle"
                checked={resetMode === 'single'}
                onChange={() => setResetMode('single')}
              />
              <Form.Check
                type="radio"
                inline
                label="Todos os colaboradores"
                name="resetMode"
                id="resetModeAll"
                checked={resetMode === 'all'}
                onChange={() => setResetMode('all')}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Form
            noValidate
            validated={validated}
            onSubmit={
              resetMode === 'single'
                ? handleResetSinglePassword
                : handleResetAllPasswords
            }
          >
            {resetMode === 'single' && (
              <Form.Group className="mb-3">
                <Form.Label>Selecione o colaborador</Form.Label>
                <Form.Select
                  value={selectedUserId}
                  onChange={(e) =>
                    setSelectedUserId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  required
                  isInvalid={validated && !selectedUserId}
                >
                  <option value="">Selecione um colaborador</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Por favor, selecione um colaborador
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Nova senha</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                  minLength={6}
                  isInvalid={validated && newPassword.length < 6}
                />
                <Button
                  variant="outline-secondary"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </Button>
                <Form.Control.Feedback type="invalid">
                  A senha deve ter pelo menos 6 caracteres
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Text className="text-muted">
                A senha deve ter pelo menos 6 caracteres
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirme a nova senha</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                  isInvalid={validated && newPassword !== confirmPassword}
                />
                <Button
                  variant="outline-secondary"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                  }
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </Button>
                <Form.Control.Feedback type="invalid">
                  As senhas não coincidem
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Button
              variant={resetMode === 'all' ? 'danger' : 'primary'}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Processando...
                </>
              ) : resetMode === 'single' ? (
                'Redefinir Senha'
              ) : (
                'Redefinir Todas as Senhas'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PasswordReset;

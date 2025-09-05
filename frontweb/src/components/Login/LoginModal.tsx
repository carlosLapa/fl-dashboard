import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import secureStorage from '../../auth/secureStorage';

interface LoginModalProps {
  show: boolean;
  onHide: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onHide }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  // Validação do email
  const validateEmail = (email: string): string => {
    // Regex para validação de email mais completa
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email é obrigatório';
    if (!emailRegex.test(email)) return 'Formato de email inválido';
    return '';
  };

  // Validação da senha
  const validatePassword = (password: string): string => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 4) return 'A senha deve ter pelo menos 4 caracteres';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setErrors((prev) => ({ ...prev, email: validateEmail(newEmail) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors((prev) => ({ ...prev, password: validatePassword(newPassword) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final antes de enviar
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    // Se houver erros, não prossegue
    if (emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password);
      secureStorage.setItem('user_email', email);
      toast.success('Autenticação bem-sucedida!');
      onHide();
    } catch (error) {
      toast.error(
        'Autenticação falhou. Por favor, verifique as suas credenciais.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={handleEmailChange}
              isInvalid={!!errors.email}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              isInvalid={!!errors.password}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'A processar...' : 'Login'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;

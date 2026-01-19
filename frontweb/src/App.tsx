import './assets/styles/_variables.scss';
import './App.css';
import { ToastContainer } from 'react-toastify';
import AppRoutes from 'routes/AppRoutes';
import { AuthProvider, useAuth } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from 'NotificationContext';
import Layout from './components/Layout/Layout';
import SessionExpirationModal from './components/SessionExpirationModal/SessionExpirationModal';

// Tempo em segundos para o aviso de expiração da sessão
const WARNING_REMAINING_SECONDS = 60;

const AppContent: React.FC = () => {
  const { user, showExpirationWarning, extendSession, logout } = useAuth();

  return (
    <NotificationProvider userId={user?.id ?? 0}>
      <Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
        />
        <AppRoutes />
        <SessionExpirationModal
          show={showExpirationWarning}
          onExtendSession={extendSession}
          onLogout={logout}
          remainingSeconds={WARNING_REMAINING_SECONDS}
        />
      </Layout>
    </NotificationProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

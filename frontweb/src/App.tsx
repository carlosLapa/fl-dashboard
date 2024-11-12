import './assets/styles/_variables.scss';
import './App.css';
import { ToastContainer } from 'react-toastify';
import AppRoutes from 'routes/AppRoutes';
import { AuthProvider, useAuth } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import NotificationList from 'components/NotificationBox/NotificationList';
import { NotificationProvider } from 'NotificationContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id ?? 0}>
      {' '}
      {/* Use nullish coalescing to provide a default value */}
      <ToastContainer autoClose={2000} />
      <NotificationList />
      <AppRoutes />
    </NotificationProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />{' '}
        {/* Separate component to ensure useAuth is within AuthProvider */}
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

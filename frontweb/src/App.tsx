import './assets/styles/_variables.scss';
import './App.css';
import { ToastContainer } from 'react-toastify';
import AppRoutes from 'routes/AppRoutes';
import { AuthProvider, useAuth } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from 'NotificationContext';
import NavbarFL from './components/Navbar/indexNavbarRB';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id ?? 0}>
      {user && <NavbarFL />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
      />
      <AppRoutes />
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

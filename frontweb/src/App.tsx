import './assets/styles/_variables.scss';
import './App.css';
import { ToastContainer } from 'react-toastify';
import AppRoutes from 'routes/AppRoutes';
import { AuthProvider } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';
import NotificationList from 'components/NotificationBox/NotificationList';
import { NotificationProvider } from 'NotificationContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ToastContainer autoClose={2000} />
          <NotificationList />
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

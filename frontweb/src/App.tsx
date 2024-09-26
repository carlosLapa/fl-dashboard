import './assets/styles/_variables.scss';
import './App.css';
import { ToastContainer } from 'react-toastify';
import AppRoutes from 'routes/AppRoutes';
import { AuthProvider } from './AuthContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer autoClose={2000} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

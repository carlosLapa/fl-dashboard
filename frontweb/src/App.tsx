import './assets/styles/_variables.scss';
import './App.css';
import AppRoutes from 'AppRoutes';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

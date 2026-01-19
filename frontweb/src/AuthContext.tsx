import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import axios from 'api/apiConfig';
import { User } from './types/user';
import { getUsersAPI } from './api/requestsApi';
import { getCurrentUserWithRoles } from './services/userService';
import { useNavigate } from 'react-router-dom';
import secureStorage from './auth/secureStorage';
import { isTokenExpired, clearTokenData } from './auth/tokenHelpers';
import { setupTokenRefreshInterceptor } from './auth/axiosInterceptors';
import { login as apiLogin, refreshToken } from './auth/authApi';
import { setupCsrfInterceptor, generateCsrfToken } from './auth/csrf';

// Configurações de timeout (em milissegundos)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos
const WARNING_TIME = 1 * 60 * 1000; // Aviso 1 minuto antes do logout

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  showExpirationWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const navigate = useNavigate();

  // Refs para os timers de inatividade
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();

  // Wrapper for the refreshToken function for consistency
  const refreshUserToken = async (): Promise<boolean> => {
    return refreshToken();
  };

  useEffect(() => {
    // Setup token refresh interceptor
    const refreshInterceptor = setupTokenRefreshInterceptor(refreshUserToken);

    // Setup CSRF protection
    const csrfInterceptor = setupCsrfInterceptor();

    // Generate initial CSRF token
    generateCsrfToken();

    return () => {
      // Clean up interceptors when component unmounts
      axios.interceptors.response.eject(refreshInterceptor);
      axios.interceptors.request.eject(csrfInterceptor);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout') {
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        navigate('/');
      }
    };

    const handleSessionExpired = () => {
      setUser(null);
      navigate('/');
      // Optional: You could add toast notification here
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:sessionExpired', handleSessionExpired);

    const initializeAuth = async () => {
      setLoading(true);
      const token = secureStorage.getItem('access_token');

      if (token) {
        // Check if token is expired
        if (isTokenExpired()) {
          console.log('Token is expired, attempting refresh');
          const refreshSuccess = await refreshUserToken();
          if (!refreshSuccess) {
            console.log('Token refresh failed, clearing auth data');
            clearTokenData();
            setLoading(false);
            return;
          }
        }

        const tokenType = 'Bearer';
        axios.defaults.headers.common['Authorization'] =
          `${tokenType} ${token}`;

        try {
          // Try to get user with roles first
          const userData = await getCurrentUserWithRoles();
          console.log('Initialized user with roles:', userData);
          setUser({
            ...userData,
            profileImage: userData.profileImage
              ? `data:image/jpeg;base64,${userData.profileImage}`
              : userData.profileImage,
          });
        } catch (error) {
          console.warn(
            'Failed to initialize user with roles, falling back:',
            error,
          );

          // Fallback to original method
          const response = await getUsersAPI();
          const email = secureStorage.getItem('user_email');
          const users = Array.isArray(response) ? response : response.content;
          const currentUser = users?.find((u: User) => u.email === email);

          if (currentUser) {
            setUser({
              ...currentUser,
              profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
            });
          } else {
            // Clear invalid session
            clearTokenData();
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }

      setLoading(false);
    };

    initializeAuth();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    console.log('Initiating login process for email:', email);
    setLoading(true);
    let errorMessage = 'An unknown error occurred';

    try {
      // Generate a new CSRF token before login
      generateCsrfToken();

      // Use the extracted login API
      const { tokenType, accessToken } = await apiLogin(email, password);

      // Set authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] =
        `${tokenType} ${accessToken}`;

      // Try to get user with roles first
      try {
        const userData = await getCurrentUserWithRoles();
        console.log('User data with roles:', userData);
        setUser({
          ...userData,
          profileImage: userData.profileImage
            ? `data:image/jpeg;base64,${userData.profileImage}`
            : userData.profileImage,
        });
        navigate('/projetos');
      } catch (error) {
        console.warn(
          'Failed to get user with roles, falling back to basic user data:',
          error,
        );

        // Fallback: Get basic user data from users list
        const response = await getUsersAPI();
        const users = Array.isArray(response) ? response : response.content;
        const currentUser = users?.find((u: User) => u.email === email);

        if (currentUser) {
          setUser({
            ...currentUser,
            profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
          });
          navigate('/projetos');
        } else {
          throw new Error('User not found');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response?.status === 403) {
          errorMessage = 'Account is locked or disabled';
        } else if (
          error.response?.status !== undefined &&
          error.response.status >= 500
        ) {
          errorMessage = 'Server error, please try again later';
        }
      }
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    console.log('Logging out user');

    // Salvar path atual antes de limpar (se não for landing page)
    if (window.location.pathname !== '/') {
      sessionStorage.setItem('lastPath', window.location.pathname);
    }

    // Clear CSRF token on logout
    secureStorage.removeItem('csrf_token');
    // Clear all token data
    clearTokenData();
    secureStorage.setItem('logout', Date.now().toString());
    setUser(null);
    setShowExpirationWarning(false);

    // Limpar timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  }, [navigate]);

  /**
   * Reseta os timers de inatividade
   */
  const resetInactivityTimer = useCallback(() => {
    // Limpar timers existentes
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Só iniciar timers se houver usuário logado
    if (user) {
      console.log('Resetting inactivity timer');

      // Timer para mostrar aviso
      warningTimerRef.current = setTimeout(() => {
        console.log('Showing session expiration warning');
        setShowExpirationWarning(true);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Timer para logout automático
      inactivityTimerRef.current = setTimeout(() => {
        console.log('Auto-logout due to inactivity');
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, logout]);

  /**
   * Estende a sessão do usuário (fecha modal e reseta timer)
   */
  const extendSession = useCallback(() => {
    console.log('Session extended by user');
    setShowExpirationWarning(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Monitorar atividade do usuário
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Iniciar timer na primeira vez
    resetInactivityTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [user, resetInactivityTimer]);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserToken,
    isTokenExpired,
    showExpirationWarning,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

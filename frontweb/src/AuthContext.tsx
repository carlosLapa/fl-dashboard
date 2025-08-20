import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'api/apiConfig';
import { User } from './types/user';
import { getUsersAPI } from './api/requestsApi';
import { getCurrentUserWithRoles } from './services/userService';
import { useNavigate } from 'react-router-dom';

// Import refactored utilities
import secureStorage from './auth/secureStorage';
import { isTokenExpired, clearTokenData } from './auth/tokenHelpers';
import { setupTokenRefreshInterceptor } from './auth/axiosInterceptors';
import { login as apiLogin, refreshToken } from './auth/authApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Wrapper for the refreshToken function for consistency
  const refreshUserToken = async (): Promise<boolean> => {
    return refreshToken();
  };

  useEffect(() => {
    // Setup token refresh interceptor
    const interceptor = setupTokenRefreshInterceptor(refreshUserToken);

    return () => {
      // Clean up interceptor when component unmounts
      axios.interceptors.response.eject(interceptor);
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
        axios.defaults.headers.common[
          'Authorization'
        ] = `${tokenType} ${token}`;

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
            error
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
      // Use the extracted login API
      const { tokenType, accessToken } = await apiLogin(email, password);

      // Set authorization header for subsequent requests
      axios.defaults.headers.common[
        'Authorization'
      ] = `${tokenType} ${accessToken}`;

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
          error
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

  const logout = () => {
    clearTokenData();
    secureStorage.setItem('logout', Date.now().toString());
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserToken,
    isTokenExpired,
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

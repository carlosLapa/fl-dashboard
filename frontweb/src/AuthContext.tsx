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
import { getCurrentUserWithRoles } from './services/userService'; // Add this import
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from 'api/apiConfig';

interface AuthContextType {
  user: User | null;
  loading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout') {
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        navigate('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (token) {
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
          const email = localStorage.getItem('user_email');
          const users = Array.isArray(response) ? response : response.content;
          const currentUser = users?.find((u: User) => u.email === email);

          if (currentUser) {
            setUser({
              ...currentUser,
              profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
            });
          } else {
            // Clear invalid session
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_email');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      }

      setLoading(false);
    };

    initializeAuth();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    console.log('Initiating login process for email:', email);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      console.log('Using API URL:', apiUrl);

      const apiClient = axios.create({
        baseURL: apiUrl,
      });

      const tokenResponse = await apiClient.post(
        '/oauth2/token',
        `grant_type=password&username=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa('myclientid:myclientsecret'),
          },
        }
      );

      const { access_token, token_type } = tokenResponse.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_email', email);

      axios.defaults.headers.common[
        'Authorization'
      ] = `${token_type} ${access_token}`;

      // CHANGE: Now try to get user with roles first
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
        console.log('Users API response:', response);

        const users = Array.isArray(response) ? response : response.content;
        console.log('Processed users array:', users);

        const currentUser = users?.find((u: User) => u.email === email);
        console.log('Found user:', currentUser, 'Searching for email:', email);

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
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    localStorage.setItem('logout', Date.now().toString());
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
  };

  const value = {
    user,
    loading, // Include loading in the context value
    login,
    logout,
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

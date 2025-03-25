import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from './api/apiConfig';
import { User } from './types/user';
import { getUsersAPI } from './api/requestsApi';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
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

    const token = localStorage.getItem('access_token');
    if (token) {
      const tokenType = 'Bearer';
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

      getUsersAPI().then((response) => {
        const email = localStorage.getItem('user_email');
        const users = Array.isArray(response) ? response : response.content;
        const currentUser = users?.find((u: User) => u.email === email);
        if (currentUser) {
          setUser({
            ...currentUser,
            profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
          });
        }
      });
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    console.log('Initiating login process for email:', email);
    try {
      const tokenResponse = await axios.post(
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
    } catch (error) {
      console.error('Login failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
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

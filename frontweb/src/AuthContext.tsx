import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import axios from 'axios';
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
    const token = localStorage.getItem('access_token');
    if (token) {
      const tokenType = 'Bearer'; // Or get this from storage if you save it
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

      // Fetch user data to restore session
      getUsersAPI().then((users) => {
        // You might want to store the email in localStorage as well
        const email = localStorage.getItem('user_email');
        const currentUser = users.find((u: User) => u.email === email);
        if (currentUser) {
          setUser({
            ...currentUser,
            profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
          });
        }
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Initiating login process for email:', email);
    try {
      console.log(
        'Sending token request to:',
        'http://localhost:8080/oauth2/token'
      );
      const tokenResponse = await axios.post(
        'http://localhost:8080/oauth2/token',
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
      console.log('Token response received:', tokenResponse.data);

      const { access_token, token_type } = tokenResponse.data;
      console.log('Access token received, type:', token_type);

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_email', email);
      axios.defaults.headers.common[
        'Authorization'
      ] = `${token_type} ${access_token}`;
      console.log('Access token stored and default headers updated');

      console.log('Fetching user data');
      const users = await getUsersAPI();
      console.log('Users data received, count:', users.length);

      const currentUser = users.find((u: User) => u.email === email);
      if (currentUser) {
        console.log('Current user found:', currentUser.name);
        setUser({
          ...currentUser,
          profileImage: `data:image/jpeg;base64,${currentUser.profileImage}`,
        });
        navigate('/projetos'); // Redirect to ProjetosPage after successful login
      } else {
        console.error('User not found in the fetched data');
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
    // Remove the token from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    // Clear the user from state
    setUser(null);

    // Remove the Authorization header
    delete axios.defaults.headers.common['Authorization'];
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

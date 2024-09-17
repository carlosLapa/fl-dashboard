import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import { User } from './types/user';
import { getUsersAPI } from './api/requestsApi';

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
        setUser(currentUser);
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

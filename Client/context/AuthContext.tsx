import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  birthday: string;
  genderSpectrum: string;
  createdAt: string;
  updatedAt?: string;
}

interface RegisterData {
  email: string;
  password: string;
  birthday: string;
  genderSpectrum: string;
}

interface ProfileData {
  birthday?: string;
  genderSpectrum?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<{ success: boolean; user: User }>;
  login: (email: string, password: string) => Promise<{ success: boolean; user: User }>;
  logout: () => Promise<void>;
  getCurrentUser: (authToken?: string) => Promise<User>;
  updateProfile: (profileData: ProfileData) => Promise<{ success: boolean; user: User }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE_URL = 'http://localhost:3000/api/auth';


  // Configure axios interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  const logout = React.useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('userToken');
      setToken(null);
      setUser(null);
  setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user, token, isAuthenticated]);

  const getCurrentUser = React.useCallback(async (authToken: string = token || ''): Promise<User> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
      throw new Error('Failed to get user profile');
    } catch (error) {
      const err = error as any;
      console.error('Error getting current user:', err?.response?.data || err?.message || err);
      logout();
      throw error;
    }
  }, [token, logout]);

  const checkAuthState = React.useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
  // console.log('[AuthContext] checkAuthState: token from storage:', storedToken);
      if (storedToken) {
        setToken(storedToken);
        try {
          await getCurrentUser(storedToken);
        } catch {
          // If token is invalid, logout will be called from getCurrentUser
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  // Check for existing token on app start
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const register = async (userData: RegisterData): Promise<{ success: boolean; user: User }> => {
    try {
  // console.log('[AuthContext] register: userData:', userData);
      const response = await axios.post(`${API_BASE_URL}/register`, userData);
  // console.log('[AuthContext] register: API response:', response.data);
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
  // console.log('[AuthContext] register: token set:', newToken);
        return { success: true, user: newUser };
      }
      throw new Error('Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message || error);
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user: User }> => {
    try {
  // console.log('[AuthContext] login: email:', email);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password
      });
  // console.log('[AuthContext] login: API response:', response.data);
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        await AsyncStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
  // console.log('[AuthContext] login: token set:', newToken);
        return { success: true, user: newUser };
      }
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message || error);
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  };

  const updateProfile = async (profileData: ProfileData): Promise<{ success: boolean; user: User }> => {
    try {
  // console.log('[AuthContext] updateProfile: profileData:', profileData);
      const response = await axios.put(`${API_BASE_URL}/profile`, profileData);
  // console.log('[AuthContext] updateProfile: API response:', response.data);
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error('Profile update failed');
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message || error);
      const message = error.response?.data?.message || 'Profile update failed';
      throw new Error(message);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

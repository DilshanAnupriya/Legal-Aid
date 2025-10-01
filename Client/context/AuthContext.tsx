import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  role: 'user' | 'lawyer' | 'ngo';
  status: string;
  createdAt: string;
  updatedAt?: string;
  // User-specific fields
  birthday?: string;
  genderSpectrum?: string;
  // Lawyer-specific fields
  firstName?: string;
  lastName?: string;
  specialization?: string;
  contactNumber?: string;
  // NGO-specific fields
  organizationName?: string;
  description?: string;
  category?: string;
  logo?: string;
  contact?: string;
  images?: string[];
  rating?: number;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'user' | 'lawyer' | 'ngo';
  // User-specific fields
  birthday?: string;
  genderSpectrum?: string;
  // Lawyer-specific fields
  firstName?: string;
  lastName?: string;
  specialization?: string;
  contactNumber?: string;
  // NGO-specific fields
  organizationName?: string;
  description?: string;
  category?: string;
  logo?: string;
  contact?: string;
  images?: string[];
}

interface ProfileData {
  // User-specific fields
  birthday?: string;
  genderSpectrum?: string;
  // Lawyer-specific fields
  firstName?: string;
  lastName?: string;
  specialization?: string;
  contactNumber?: string;
  // NGO-specific fields
  organizationName?: string;
  description?: string;
  category?: string;
  logo?: string;
  contact?: string;
  images?: string[];
  status?: string;
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
  // Role-based helper functions
  isUser: () => boolean;
  isLawyer: () => boolean;
  isNgo: () => boolean;
  hasRole: (role: 'user' | 'lawyer' | 'ngo') => boolean;
  getUserDisplayName: () => string;
  getUserTypeLabel: () => string;
  getProfileRoute: () => string;
  isProfileComplete: () => boolean;
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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);


  // Platform-specific API URL configuration with fallback options
  const getApiUrls = () => {
    if (Platform.OS === 'web') {
      return [
        'http://localhost:3000/api/auth',
        'http://127.0.0.1:3000/api/auth',
      ];
    } else if (Platform.OS === 'android') {
      return [
        'http://10.0.2.2:3000/api/auth',     // Android emulator
        'http://localhost:3000/api/auth',    // Fallback
      ];
    } else {
      // iOS simulator
      return [
        'http://localhost:3000/api/auth',
        'http://127.0.0.1:3000/api/auth',
      ];
    }
  };

  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, localhost should work
  // For physical device, use your computer's IP address

  // const API_URLS = Platform.OS === 'android'
  // ? [
  //     'http://10.0.2.2:3000/api/auth',   // Android emulator
  //     'http://10.4.2.1:3000/api/auth', // Your computer's LAN IP (replace with yours)
  //     'http://localhost:3000/api/auth',  // Fallback
  //   ]
  // : [
  //     'http://10.4.2.1:3000/api/auth', // Your computer's LAN IP (replace with yours)
  //     'http://localhost:3000/api/auth',     // iOS simulator
  //   ];

  const [currentApiIndex, setCurrentApiIndex] = useState(0);
  const API_URLS = getApiUrls();
  const API_BASE_URL = API_URLS[currentApiIndex];

  // Try next API URL if current one fails (currently unused but kept for future extensibility)
  // const tryNextApiUrl = () => {
  //   const nextIndex = (currentApiIndex + 1) % API_URLS.length;
  //   console.log(`[AuthContext] Trying next API URL: ${API_URLS[nextIndex]}`);
  //   setCurrentApiIndex(nextIndex);
  //   return nextIndex !== currentApiIndex; // Return false if we've tried all URLs
  // };

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
      console.log('[AuthContext] Starting logout process...');
      console.log('[AuthContext] Current auth state - isAuthenticated:', isAuthenticated, 'user:', !!user);
      
      // Clear stored token
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      console.log('[AuthContext] Token removed from storage');
      
      // Clear context state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setHasCheckedAuth(false); // Reset flag to allow re-checking auth state
      
      console.log('[AuthContext] Auth state cleared - isAuthenticated set to false');
      console.log('[AuthContext] Logout completed successfully');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Even if there's an error clearing storage, we should still clear the context state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setHasCheckedAuth(false);
    }
  }, [isAuthenticated, user]);

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
    } catch (err) {
      const error = err as any;
      console.error('Error getting current user:', error?.response?.data || error?.message || error);
      logout();
      throw err;
    }
  }, [token, logout, API_BASE_URL]);

  const checkAuthState = React.useCallback(async () => {

    const storedToken = await AsyncStorage.getItem('userToken');
const storedRole = await AsyncStorage.getItem('userRole');
if (storedToken && storedRole) {
  setToken(storedToken);
  setUser(prev => prev ? { ...prev, role: storedRole as User['role'] } : null);
}
    // Prevent multiple executions
    if (hasCheckedAuth) {
      return;
    }
    
    try {
      console.log('[AuthContext] checkAuthState: Checking authentication state...');
      const storedToken = await AsyncStorage.getItem('userToken');
      
      if (storedToken) {
        console.log('[AuthContext] checkAuthState: Token found, validating...');
        setToken(storedToken);
        try {
          await getCurrentUser(storedToken);
          console.log('[AuthContext] checkAuthState: User authenticated successfully');
        } catch {
          console.log('[AuthContext] checkAuthState: Token validation failed, logging out');
          // If token is invalid, logout will be called from getCurrentUser
        }
      } else {
        console.log('[AuthContext] checkAuthState: No stored token, user not authenticated');
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth state:', error);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, [hasCheckedAuth, getCurrentUser]);

  // Check for existing token on app start
  useEffect(() => {
  checkAuthState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ only run once when app starts

  const register = async (userData: RegisterData): Promise<{ success: boolean; user: User }> => {
    console.log(`[AuthContext] register: attempting with ${API_BASE_URL}`);
    
    const attemptRegister = async (url: string) => {
      const response = await axios.post(`${url}/register`, userData);
      return response;
    };

    let lastError: any;
    
    // Try current URL first, then fallbacks
    for (let i = 0; i < API_URLS.length; i++) {
      try {
        const currentUrl = API_URLS[(currentApiIndex + i) % API_URLS.length];
        console.log(`[AuthContext] register: trying ${currentUrl}`);
        
        const response = await attemptRegister(currentUrl);
        
        if (response.data.success) {
          // Update to successful URL index
          setCurrentApiIndex((currentApiIndex + i) % API_URLS.length);
          
          const { token: newToken, user: newUser } = response.data;
          await AsyncStorage.setItem('userToken', newToken);
          await AsyncStorage.setItem('userRole', newUser.role);
          setToken(newToken);
          setUser(newUser);
          setIsAuthenticated(true);
          setHasCheckedAuth(true);
          
          console.log('[AuthContext] register: success with', currentUrl);
          return { success: true, user: newUser };
        }
        throw new Error('Registration failed');
      } catch (error: any) {
        console.error(`[AuthContext] register error with ${API_URLS[(currentApiIndex + i) % API_URLS.length]}:`, error.response?.data || error.message || error);
        lastError = error;
        
        // If it's a network error, try next URL
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
          continue;
        }
        
        // If it's an authentication error (4xx), don't try other URLs
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }
    
    const message = lastError?.response?.data?.message || 'Registration failed - unable to connect to server';
    throw new Error(message);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; user: User }> => {
    
    
    const attemptLogin = async (url: string) => {
      const response = await axios.post(`${url}/login`, {
        email,
        password
      });
      return response;
    };

    let lastError: any;
    
    // Try current URL first, then fallbacks
    for (let i = 0; i < API_URLS.length; i++) {
      try {
        const currentUrl = API_URLS[(currentApiIndex + i) % API_URLS.length];
       
        
        const response = await attemptLogin(currentUrl);
        
        if (response.data.success) {
          // Update to successful URL index
          setCurrentApiIndex((currentApiIndex + i) % API_URLS.length);
          
          const { token: newToken, user: newUser } = response.data;
          await AsyncStorage.setItem('userToken', newToken);
          await AsyncStorage.setItem('userRole', newUser.role);

          setToken(newToken);
          setUser(newUser);
          
          setIsAuthenticated(true);
          setHasCheckedAuth(true);
          
          
          return { success: true, user: newUser };
        }
        throw new Error('Login failed');
      } catch (error: any) {
        console.error(`[AuthContext] login error with ${API_URLS[(currentApiIndex + i) % API_URLS.length]}:`, error.response?.data || error.message || error);
        lastError = error;
        
        // If it's a network error, try next URL
        if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || !error.response) {
          continue;
        }
        
        // If it's an authentication error (4xx), don't try other URLs
        if (error.response?.status >= 400 && error.response?.status < 500) {
          break;
        }
      }
    }
    
    const message = lastError?.response?.data?.message || 'Login failed - unable to connect to server';
    throw new Error(message);
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

  // Role-based helper functions
  const isUser = (): boolean => {
    return user?.role === 'user';
  };

  const isLawyer = (): boolean => {
    return user?.role === 'lawyer';
  };

  const isNgo = (): boolean => {
    return user?.role === 'ngo';
  };

  const hasRole = (role: 'user' | 'lawyer' | 'ngo'): boolean => {
    return user?.role === role;
  };

  // Additional helper functions for role-based functionality
  const getUserDisplayName = (): string => {
    if (!user) return 'User';
    
    switch (user.role) {
      case 'lawyer':
        return user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.email;
      case 'ngo':
        return user.organizationName || user.email;
      case 'user':
      default:
        return user.email;
    }
  };

  const getUserTypeLabel = (): string => {
    if (!user) return 'User';
    switch (user.role) {
      case 'user':
        return 'Regular User';
      case 'lawyer':
        return 'Legal Professional';
      case 'ngo':
        return 'NGO Representative';
      default:
        return 'User';
    }
  };

  const getProfileRoute = (): string => {
    if (!user) return 'UserProfile';
    
    switch (user.role) {
      case 'user':
        return 'UserProfile';
      case 'lawyer':
        return 'LawyerOwnProfile';
      case 'ngo':
        return 'NgoOwnProfile';
      default:
        return 'UserProfile';
    }
  };

  const isProfileComplete = (): boolean => {
    if (!user) return false;
    
    switch (user.role) {
      case 'user':
        return !!(user.birthday && user.genderSpectrum);
      case 'lawyer':
        return !!(user.firstName && user.lastName && user.specialization && user.contactNumber);
      case 'ngo':
        return !!(user.organizationName && user.description && user.category && user.contact);
      default:
        return false;
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
    updateProfile,
    isUser,
    isLawyer,
    isNgo,
    hasRole,
    getUserDisplayName,
    getUserTypeLabel,
    getProfileRoute,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

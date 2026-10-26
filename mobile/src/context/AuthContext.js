import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, initApiConfig, setApiBaseUrl, resetToLiveMetroHost, API_BASE_URL } from '../api/api';

const TOKEN_KEY = '@tms_auth_token';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  serverUrl: '',
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  changeServerUrl: async () => {},
  resetServerUrl: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverUrl, setServerUrl] = useState(API_BASE_URL);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      const activeUrl = await initApiConfig();
      setServerUrl(activeUrl);

      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        setToken(savedToken);
        try {
          const profileRes = await authService.getProfile();
          setUser(profileRes.data?.data || profileRes.data);
        } catch (err) {
          console.warn('Stored token expired or invalid:', err?.message);
          await AsyncStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Auth bootstrap failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const data = response.data;
    const newToken = data.token;
    const userData = data.user || data.data;

    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userData);
    return data;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.warn('Error removing token during logout', err);
    }
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profileRes = await authService.getProfile();
      setUser(profileRes.data?.data || profileRes.data);
    } catch (err) {
      console.warn('Failed to refresh profile', err);
    }
  };

  const changeServerUrl = async (newUrl) => {
    const updated = await setApiBaseUrl(newUrl, true);
    setServerUrl(updated);
    return updated;
  };

  const resetServerUrl = async () => {
    const updated = await resetToLiveMetroHost();
    setServerUrl(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        serverUrl,
        login,
        logout,
        refreshProfile,
        changeServerUrl,
        resetServerUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

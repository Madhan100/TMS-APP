import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Helper to auto-detect Metro server IP when running Expo Go on mobile
export const getDevHostIp = () => {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      Constants.manifest2?.extra?.expoClient?.hostUri ||
      Constants.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return ip;
      }
    }
  } catch (e) {
    // fallback
  }

  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // fallback
  }

  return '192.168.203.93';
};

// Active local Wi-Fi IP address (PC's current Wi-Fi IP: 192.168.203.93)
export const ACTIVE_LAN_IP = getDevHostIp();

export const getDefaultHost = () => {
  if (Platform.OS === 'web') return 'http://localhost:5000/api';
  return `http://${getDevHostIp()}:5000/api`;
};

// Default host based on environment
const DEFAULT_HOST = getDefaultHost();

const STORAGE_KEYS = {
  TOKEN: '@tms_auth_token',
  API_URL: '@tms_api_base_url_v11',
  IS_MANUAL_OVERRIDE: '@tms_api_manual_override_v11',
};

export let API_BASE_URL = DEFAULT_HOST;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Initialize configured base URL from storage or auto-sync with live Metro IP
export const initApiConfig = async () => {
  try {
    const liveDefault = getDefaultHost();
    const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    const isManual = await AsyncStorage.getItem(STORAGE_KEYS.IS_MANUAL_OVERRIDE);

    // Only stick to savedUrl if the user manually typed & saved a custom URL in ServerConfigModal.
    // Otherwise, always automatically sync to current PC Metro IP so Wi-Fi changes NEVER fail!
    if (isManual === 'true' && savedUrl) {
      API_BASE_URL = savedUrl;
      api.defaults.baseURL = savedUrl;
    } else {
      API_BASE_URL = liveDefault;
      api.defaults.baseURL = liveDefault;
      await AsyncStorage.setItem(STORAGE_KEYS.API_URL, liveDefault);
    }
  } catch (e) {
    console.warn('Could not load saved API base URL', e);
  }
  return api.defaults.baseURL;
};

// Update and persist API Base URL
export const setApiBaseUrl = async (newUrl, isManual = true) => {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  const urlWithApi = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  API_BASE_URL = urlWithApi;
  api.defaults.baseURL = urlWithApi;
  await AsyncStorage.setItem(STORAGE_KEYS.API_URL, urlWithApi);
  if (isManual) {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_MANUAL_OVERRIDE, 'true');
  }
  return urlWithApi;
};

// Reset to live auto-detected PC IP
export const resetToLiveMetroHost = async () => {
  const liveDefault = getDefaultHost();
  API_BASE_URL = liveDefault;
  api.defaults.baseURL = liveDefault;
  await AsyncStorage.removeItem(STORAGE_KEYS.IS_MANUAL_OVERRIDE);
  await AsyncStorage.setItem(STORAGE_KEYS.API_URL, liveDefault);
  return liveDefault;
};

// Add token & dynamic baseURL interceptor
api.interceptors.request.use(async (config) => {
  if (API_BASE_URL) {
    config.baseURL = API_BASE_URL;
  }
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Error attaching auth token', err);
  }
  return config;
});

/* AUTH SERVICES */
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

/* DEPARTMENTS */
export const departmentService = {
  create: (data) => api.post('/departments', data),
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

/* PROGRAMMES */
export const programmeService = {
  create: (data) => api.post('/programmes', data),
  getAll: (params) => api.get('/programmes', { params }),
  getById: (id) => api.get(`/programmes/${id}`),
  update: (id, data) => api.put(`/programmes/${id}`, data),
  delete: (id) => api.delete(`/programmes/${id}`),
};

/* BLOCKS */
export const blockService = {
  create: (data) => api.post('/blocks', data),
  getAll: (params) => api.get('/blocks', { params }),
  getById: (id) => api.get(`/blocks/${id}`),
  update: (id, data) => api.put(`/blocks/${id}`, data),
  delete: (id) => api.delete(`/blocks/${id}`),
};

/* ROOMS */
export const roomService = {
  create: (data) => api.post('/rooms', data),
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

/* ROLES */
export const roleService = {
  create: (data) => api.post('/roles', data),
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
};

/* USERS */
export const userService = {
  create: (data) => api.post('/users', data),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

/* COMPLAINTS */
export const complaintService = {
  create: (formData) =>
    api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  getStats: () => api.get('/complaints/stats'),
  assign: (id, assignedTo) => api.patch(`/complaints/${id}/assign`, { assignedTo }),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  report: (params) => api.get('/complaints/report', { params }),
};

export default api;

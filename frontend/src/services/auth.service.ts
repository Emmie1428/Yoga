import api from './api';
import { AuthResponse, LoginCredentials, RegisterData } from '../types';


export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): AuthResponse | null => {
    const user = localStorage.getItem('user');
    if(!user) { 
      return null
    }
    return JSON.parse(user) as AuthResponse
  },

  updateCurrentUser: (updates: Partial<AuthResponse>): AuthResponse | null => {
    const user = authService.getCurrentUser()
    if(!user) { 
      return null
    }
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') != null;
  },
};

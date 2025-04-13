import axios from 'axios';

// Créer une instance axios avec une configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs d'authentification
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Services API pour les EPIs
export const epiService = {
  getAll: () => api.get<ApiResponse<any[]>>('/epis'),
  getById: (id: string | number) => api.get<ApiResponse<any>>(`/epis/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/epis', data),
  update: (id: string | number, data: any) => api.put<ApiResponse<any>>(`/epis/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/epis/${id}`),
  getNeedingControl: (days: number = 30) => api.get<ApiResponse<any[]>>(`/epis/need-control?days=${days}`),
};

// Services API pour les contrôles
export const controleService = {
  getAll: () => api.get<ApiResponse<any[]>>('/controles'),
  getById: (id: string | number) => api.get<ApiResponse<any>>(`/controles/${id}`),
  getByEpiId: (epiId: string | number) => api.get<ApiResponse<any[]>>(`/controles/epi/${epiId}`),
  create: (data: any) => api.post<ApiResponse<any>>('/controles', data),
  update: (id: string | number, data: any) => api.put<ApiResponse<any>>(`/controles/${id}`, data),
  delete: (id: string | number) => api.delete<ApiResponse<void>>(`/controles/${id}`),
};

// Service d'authentification
export const authService = {
  login: (email: string, password: string) => 
    api.post<ApiResponse<{ token: string, user: any }>>('/users/login', { email, password }),
  register: (userData: any) => 
    api.post<ApiResponse<any>>('/users/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  },
};

export default api;

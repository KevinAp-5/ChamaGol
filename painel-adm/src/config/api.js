import axios from "axios";

/*const BASE_URL = process.env.REACT_APP_API_URL || "https://chamagol.com";*/
// const BASE_URL = "http://192.168.0.106:8080"
const BASE_URL = "https://chamagol.com/"
const TOKEN_KEY = "chamagol_admin_token";
const REFRESH_TOKEN_KEY = "chamagol_admin_refresh_token";

// Configuração da instância do axios
const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json",
  },
});

// Interceptador para adicionar token nas requisições
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratar respostas e refresh token
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Se erro 401 e não é um retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken
          });
          
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          
          // Atualiza tokens
          localStorage.setItem(TOKEN_KEY, newToken);
          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          
          // Retry da requisição original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh falhou, redireciona para login
          api.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Sem refresh token, redireciona para login
        api.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Função para formatar erros de resposta
const formatError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Erro no servidor',
      data: error.response.data
    };
  } else if (error.request) {
    return {
      status: 0,
      message: 'Erro de conexão. Verifique sua internet.',
      data: null
    };
  } else {
    return {
      status: -1,
      message: error.message || 'Erro desconhecido',
      data: null
    };
  }
};

export const api = {
  // Métodos HTTP básicos
  get: async (endpoint, config = {}) => {
    try {
      const response = await instance.get(endpoint, config);
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },
  
  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await instance.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },
  
  put: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await instance.put(endpoint, data, config);
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },
  
  patch: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await instance.patch(endpoint, data, config);
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },
  
  delete: async (endpoint, config = {}) => {
    try {
      const response = await instance.delete(endpoint, config);
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },
  
  // Gerenciamento de tokens
  setTokens: (token, refreshToken = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  
  // Verificar se está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  },
  
  // Método para upload de arquivos
  uploadFile: async (endpoint, file, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await instance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        } : undefined
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  }
};

// Configuração do timeout personalizado
export const setApiTimeout = (timeout) => {
  instance.defaults.timeout = timeout;
};

// Configuração da URL base
export const setApiBaseURL = (baseURL) => {
  instance.defaults.baseURL = baseURL;
};

export default api;
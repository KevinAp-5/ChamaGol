import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import * as SecureStore from "expo-secure-store";

// Tipos e interfaces
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
}

type HttpMethod = Method;

// Constantes
// const BASE_URL = 'https://chamagol-9gfb.onrender.com/api';
export const BASE_URL = 'https://chamagol.com/api';
// export const BASE_URL = 'http://192.168.0.103:8080/api';
const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};
const CLIENT_TYPE = 'MOBILE';

// Lista de endpoints de autenticação que não precisam de token para acessar
const PUBLIC_ENDPOINTS = [
  'auth/login',
  'auth/register',
  'auth/activate',
  'auth/password/reset',
  'auth/password/forgot'
];

// Configuração do Axios
const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
   'Accept': 'application/json',
  },
};

/**
 * Classe ApiService para gerenciar requisições HTTP e autenticação
 */
class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  constructor() {
    this.instance = axios.create(DEFAULT_CONFIG);
    this.setupInterceptors();
  }

  /**
   * Configura os interceptors para o Axios
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        // Somente adiciona token em endpoints que não são públicos
        if (!this.isPublicEndpoint(config.url)) {
          const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Se não há configuração ou é endpoint público, rejeita diretamente
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (!originalRequest || this.isPublicEndpoint(originalRequest.url)) {
          return Promise.reject(error);
        }

        // Verifica se é erro 401 e não é uma tentativa de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Se já estiver em refresh, adiciona à fila
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            
            if (newToken) {
              // Atualiza header da requisição original
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              // Processa fila de requisições pendentes
              this.processQueue(null, newToken);
              
              // Refaz a requisição original
              return this.instance.request(originalRequest);
            } else {
              // Sem token, rejeita todas as requisições
              this.processQueue(new Error('Falha no refresh token'), null);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Erro no refresh, rejeita todas as requisições
            this.processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Para outros erros, apenas rejeita
        return Promise.reject(error);
      }
    );
  }

  /**
   * Verifica se o endpoint é público (não requer autenticação)
   */
  private isPublicEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
  }

  /**
   * Processa a fila de requisições pendentes após refresh do token
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(item => {
      if (error) {
        item.reject(error);
      } else {
        if (token && item.config.headers) {
          item.config.headers.Authorization = `Bearer ${token}`;
        }
        item.resolve(this.instance.request(item.config));
      }
    });
    
    // Limpa a fila após processar
    this.failedQueue = [];
  }

  /**
   * Atualiza o token usando refreshToken
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      
      if (!refreshToken) {
        console.log('Nenhum refresh token disponível');
        await this.clearTokens();
        return null;
      }

      const response = await axios.post<TokenResponse>(
        `${BASE_URL}auth/token/refresh`,
        { token: refreshToken },
        {
          headers: DEFAULT_CONFIG.headers,
          params: { clientType: CLIENT_TYPE },
        }
      );

      if (response.data?.token) {
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;
        
        // Salva novos tokens
        await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, newAccessToken);
        
        if (newRefreshToken) {
          await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, newRefreshToken);
        }
        
        console.log('Token atualizado com sucesso');
        return newAccessToken;
      }
      
      console.log('Resposta de refresh inválida');
      await this.clearTokens();
      return null;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Erro ao atualizar token:", 
        axiosError.response?.data || axiosError.message
      );
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Salva os tokens após login bem-sucedido
   */
  private async saveAuthTokens(data: any): Promise<void> {
    try {
      if (!data) return;
      
      // Verifica propriedades token e refreshToken no objeto
      if (typeof data === 'object') {
        const { token, refreshToken } = data;
        
        if (token) {
          await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, token);
          console.log('Token de acesso salvo');
          
          if (refreshToken) {
            await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
            console.log('Refresh token salvo');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar tokens:', error);
    }
  }

  /**
   * Limpa os tokens do SecureStore
   */
  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
      console.log('Tokens removidos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar tokens:', error);
    }
  }

  /**
   * Método para fazer login
   */
  public async login<T = unknown>(credentials: { login: string; password: string }): Promise<ApiResponse<T>> {
    try {
      console.log('[API] Tentando login com:', credentials.login);
      
      const response = await this.instance.post<T>('auth/login', credentials, {
        params: { clientType: CLIENT_TYPE },
      });
      
      console.log('[API] Login bem-sucedido');
      
      // Salva tokens recebidos no login
      await this.saveAuthTokens(response.data);
      
      // Converte headers
      const headers = Object.fromEntries(
        Object.entries(response.headers).map(([key, value]) => [key, String(value)])
      );
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        '[API] Erro no login:', 
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  }

  /**
   * Método para logout
   */
  public async logout(): Promise<void> {
    try {
      await this.clearTokens();
      console.log('[API] Logout realizado');
    } catch (error) {
      console.error('[API] Erro no logout:', error);
    }
  }

  /**
   * Método principal para fazer requisições API
   */
  public async request<T = unknown, D = unknown>(
    method: HttpMethod,
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`[API] Requisição para: ${endpoint}`, method, data ? data : '');

      const response = await this.instance.request<T>({
        method,
        url: endpoint,
        data,
        ...config,
      });

      console.log(`[API] Resposta de: ${endpoint}`, response.status);
      
      // Verifica se é uma resposta de login para salvar tokens
      if (endpoint === 'auth/login') {
        await this.saveAuthTokens(response.data);
      }
      
      // Converte headers para formato esperado
      const headers = Object.fromEntries(
        Object.entries(response.headers).map(([key, value]) => [key, String(value)])
      );
      
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        `[API] Erro em ${method.toUpperCase()} ${endpoint}:`, 
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
    return !!token;
  }
}

// Instância singleton do serviço
const apiService = new ApiService();

// Métodos de conveniência exportados
export const api = {
  get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) => 
    apiService.request<T>('GET', endpoint, undefined, config),
    
  post: <T = unknown, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig) => 
    apiService.request<T, D>('POST', endpoint, data, config),
    
  put: <T = unknown, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig) => 
    apiService.request<T, D>('PUT', endpoint, data, config),
    
  patch: <T = unknown, D = unknown>(endpoint: string, data?: D, config?: AxiosRequestConfig) => 
    apiService.request<T, D>('PATCH', endpoint, data, config),
    
  delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) => 
    apiService.request<T>('DELETE', endpoint, undefined, config),
  
  login: <T = unknown>(credentials: { login: string; password: string }) => 
    apiService.login<T>(credentials),
    
  logout: () => apiService.logout(),
  
  isAuthenticated: () => apiService.isAuthenticated(),
};

export default api;
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
  config: AxiosRequestConfig & { _retry?: boolean };
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
}

type HttpMethod = Method;

// export const BASE_URL = 'https://chamagol.com/api';
export const BASE_URL = 'http://192.168.0.106:8080/api';

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};
const CLIENT_TYPE = 'MOBILE';

const PUBLIC_ENDPOINTS = [
  'auth/login',
  'auth/register',
  'auth/activate',
  'auth/password/reset',
  'auth/password/forgot',
];

const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json',
  },
};

class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  constructor() {
    this.instance = axios.create(DEFAULT_CONFIG);
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // ── Request Interceptor ──────────────────────────────────────────────────
    this.instance.interceptors.request.use(
      async (config) => {
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

    // ── Response Interceptor ─────────────────────────────────────────────────
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Sem config ou endpoint público — rejeita direto, sem tentar refresh
        if (!originalRequest || this.isPublicEndpoint(originalRequest.url)) {
          return Promise.reject(error);
        }

        // Apenas trata 401. Outros erros (4xx, 5xx) são repassados imediatamente.
        if (error.response?.status !== 401) {
          return Promise.reject(error);
        }

        // FIX: _retry impede que a re-execução de uma request (seja original ou
        // vinda da fila) dispare um segundo ciclo de refresh caso receba 401 de novo.
        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        // Se já está refrescando, enfileira e aguarda resolução
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        // Marca e inicia o refresh
        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();

          if (newToken) {
            // Aplica o novo token à requisição original
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Resolve todas as requests enfileiradas com o novo token
            this.processQueue(null, newToken);

            return this.instance.request(originalRequest);
          } else {
            // Refresh retornou null (sem refresh token ou resposta inválida)
            this.processQueue(new Error('Falha no refresh token'), null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }

  private isPublicEndpoint(url: string | undefined): boolean {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }

  /**
   * Processa a fila de requests pendentes após o refresh.
   *
   * FIX: Cada request enfileirada recebe `_retry = true` antes de ser
   * re-executada, garantindo que um novo 401 não dispare outro ciclo de refresh.
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((item) => {
      if (error) {
        item.reject(error);
      } else {
        // FIX 1: Garante que headers existe antes de setar o token
        item.config.headers = item.config.headers || {};
        if (token) {
          item.config.headers.Authorization = `Bearer ${token}`;
        }

        // FIX 2: Marca como retry para evitar loop infinito caso receba 401 de novo
        item.config._retry = true;

        item.resolve(this.instance.request(item.config));
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);

      if (!refreshToken) {
        console.log('[API] Nenhum refresh token disponível');
        await this.clearTokens();
        return null;
      }

      const response = await axios.post<TokenResponse>(
        `${BASE_URL}/auth/token/refresh`,
        { token: refreshToken },
        {
          headers: DEFAULT_CONFIG.headers,
          params: { clientType: CLIENT_TYPE },
        }
      );

      if (response.data?.token) {
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, newAccessToken);
        if (newRefreshToken) {
          await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, newRefreshToken);
        }

        console.log('[API] Token atualizado com sucesso');
        return newAccessToken;
      }

      console.log('[API] Resposta de refresh inválida');
      await this.clearTokens();
      return null;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        '[API] Erro ao atualizar token:',
        axiosError.response?.data || axiosError.message
      );
      await this.clearTokens();
      return null;
    }
  }

  private async saveAuthTokens(data: any): Promise<void> {
    try {
      if (!data || typeof data !== 'object') return;
      const { token, refreshToken } = data;
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, token);
        if (refreshToken) {
          await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
        }
      }
    } catch (error) {
      console.error('[API] Erro ao salvar tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
      console.log('[API] Tokens removidos');
    } catch (error) {
      console.error('[API] Erro ao limpar tokens:', error);
    }
  }

  public async login<T = unknown>(credentials: {
    login: string;
    password: string;
  }): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>('auth/login', credentials, {
        params: { clientType: CLIENT_TYPE },
      });

      await this.saveAuthTokens(response.data);

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

  public async logout(): Promise<void> {
    try {
      await this.clearTokens();
      console.log('[API] Logout realizado');
    } catch (error) {
      console.error('[API] Erro no logout:', error);
    }
  }

  public async request<T = unknown, D = unknown>(
    method: HttpMethod,
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request<T>({
        method,
        url: endpoint,
        data,
        ...config,
      });

      if (endpoint === 'auth/login') {
        await this.saveAuthTokens(response.data);
      }

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
        `[API] Erro em ${method.toString().toUpperCase()} ${endpoint}:`,
        axiosError.response?.data || axiosError.message
      );
      throw error;
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
    return !!token;
  }
}

// Singleton
const apiService = new ApiService();

export const api = {
  get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
    apiService.request<T>('GET', endpoint, undefined, config),

  post: <T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiService.request<T, D>('POST', endpoint, data, config),

  put: <T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiService.request<T, D>('PUT', endpoint, data, config),

  patch: <T = unknown, D = unknown>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ) => apiService.request<T, D>('PATCH', endpoint, data, config),

  delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
    apiService.request<T>('DELETE', endpoint, undefined, config),

  login: <T = unknown>(credentials: { login: string; password: string }) =>
    apiService.login<T>(credentials),

  logout: () => apiService.logout(),

  isAuthenticated: () => apiService.isAuthenticated(),
};

export default api;
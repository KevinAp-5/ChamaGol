import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';

// Interface para tipagem do response da API (ajuste conforme sua API)
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Tipos de métodos HTTP suportados
type HttpMethod = Method;

// Configuração padrão da API
const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: 'http://192.168.1.7:8080/api/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json',
  },
};

// Cria instância reutilizável do Axios
const createApiInstance = (config: AxiosRequestConfig = {}): AxiosInstance => {
  const instance = axios.create({ ...DEFAULT_CONFIG, ...config });

  // Interceptores para tratamento global
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Não mostrar erro noBridgeError no console
      if (
        error.message &&
        error.message.toLowerCase().includes("nobridgeerror")
      ) {
        // Silencia o erro nobridgeError
        return Promise.reject(error);
      }
      handleApiError(error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Tratamento centralizado de erros
const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    console.log(
      `API Error - Status: ${error.response.status}`,
      error.response.data
    );
  } else if (error.request) {
    // Não mostrar nobridgeError
    if (
      error.message &&
      error.message.toLowerCase().includes("nobridgeerror")
    ) {
      return;
    }
    console.log('API Error - No response received:', error.request);
  } else {
    console.log('API Error - Request setup error:', error.message);
  }
};

// Função principal da API com tipagem genérica
export const api = async <T = unknown, D = unknown>(
  method: HttpMethod,
  endpoint: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const apiInstance = createApiInstance();

  try {
    console.log(`[API] Request to: ${endpoint}`, data);

    const response: AxiosResponse<T> = await apiInstance.request<T>({
      method,
      url: endpoint,
      data,
      ...config,
    });

    console.log(`[API] Response from: ${endpoint}`, response.data);
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
    // Não mostrar nobridgeError
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("nobridgeerror")
    ) {
      // Silencia o erro nobridgeError
      throw error;
    }
    console.log(`[API] Error in ${method.toUpperCase()} ${endpoint}:`, error);
    throw error;
  }
};

// Helper para definir o token de autenticação
export const setAuthToken = (token: string | null): void => {
  const authHeader = token ? `Bearer ${token}` : null;
  DEFAULT_CONFIG.headers.Authorization = authHeader;
};

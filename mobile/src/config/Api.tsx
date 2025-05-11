import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';

import * as SecureStore from "expo-secure-store";

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

type HttpMethod = Method;

const BASE_URL = 'http://192.168.1.7:8080/api/';

const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json',
  },
};

let apiInstance: AxiosInstance | null = null;

// Flag para controlar refresh em andamento
let isRefreshing = false;
// Lista de requisições pendentes enquanto refresh acontece
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      if (token && prom.config.headers) {
        prom.config.headers['Authorization'] = `Bearer ${token}`;
      }
      prom.resolve(apiInstance!.request(prom.config));
    }
  });
  failedQueue = [];
};

export const setAuthToken = (token: string | null): void => {
  if (!apiInstance) return;
  if (token) {
    apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiInstance.defaults.headers.common['Authorization'];
  }
};

const getApiInstance = async (): Promise<AxiosInstance> => {
  if (apiInstance) return apiInstance;

  apiInstance = axios.create(DEFAULT_CONFIG);

  apiInstance.interceptors.request.use(async (config) => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  });

  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      if (
        error.message &&
        error.message.toLowerCase().includes("nobridgeerror")
      ) {
        return Promise.reject(error);
      }

      if (
        error.response &&
        error.response.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // Enfileira a requisição para aguardar refresh
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          if (!newToken) throw new Error('Failed to refresh token');

          setAuthToken(newToken);

          processQueue(null, newToken);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          return apiInstance.request(originalRequest);
        } catch (err) {
          processQueue(err, null);
          // Limpa tokens se refresh falhar
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return apiInstance;
};

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      console.log("[refreshAccessToken] Nenhum refresh token encontrado.");
      return null;
    }

    const clientType = "MOBILE"; // ajuste conforme seu cliente

    const response = await axios.post(
      `${BASE_URL}auth/token/refresh`,
      { token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
        params: { clientType },
      }
    );

    if (response.status === 200 && response.data?.token) {
      const newAccessToken = response.data.token;
      const newRefreshToken = response.data.refreshToken;

      await SecureStore.setItemAsync('accessToken', newAccessToken);

      if (newRefreshToken) {
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);
      }

      return newAccessToken;
    }

    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    return null;
  } catch (error: any) {
    console.error("[refreshAccessToken] Erro ao atualizar token:", error.response?.data || error.message || error);
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    return null;
  }
}

const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    console.log(
      `API Error - Status: ${error.response.status}`,
      error.response.data
    );
  } else if (error.request) {
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

export const api = async <T = unknown, D = unknown>(
  method: HttpMethod,
  endpoint: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  const instance = await getApiInstance();

  try {
    console.log(`[API] Request to: ${endpoint}`, data);

    const response: AxiosResponse<T> = await instance.request<T>({
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
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("nobridgeerror")
    ) {
      throw error;
    }
    console.log(`[API] Error in ${method.toUpperCase()} ${endpoint}:`, error);
    throw error;
  }
};

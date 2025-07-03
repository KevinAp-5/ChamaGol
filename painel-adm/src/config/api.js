import axios from "axios";

const BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "token";

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json",
  },
});

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

export const api = {
  get: (endpoint, config) => instance.get(endpoint, config),
  post: (endpoint, data, config) => instance.post(endpoint, data, config),
  put: (endpoint, data, config) => instance.put(endpoint, data, config),
  patch: (endpoint, data, config) => instance.patch(endpoint, data, config),
  delete: (endpoint, config) => instance.delete(endpoint, config),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getToken: () => localStorage.getItem(TOKEN_KEY),
};
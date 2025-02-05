import axios from "axios";

const API_URL = "http://192.168.1.6:8080/api/";

// Configuração de headers simplificada
const axiosConfig = {
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json", // Altere se o servidor requer algo diferente
    Authorization: null, // Insira o token aqui se necessário
  },
};

const Api = async (method, endpoint, data) => {
  console.log(`${API_URL}${endpoint}`);
  console.log(data);

  try {
    const res = await axios({
      method: method,
      baseURL: API_URL,
      url: endpoint,
      headers: axiosConfig.headers,
      timeout: 15000, // Tempo limite de 15 segundos
      data: data, // Dados enviados no corpo
    });

    console.log("Response data:", res.data);
    return res; // Retorna a resposta completa
  } catch (error) {
    // Tratamento de erro para identificação
    if (error.response) {
      console.error("Erro no servidor:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Erro na requisição (provavelmente CORS):", error.request);
    } else {
      console.error("Erro desconhecido:", error.message);
    }

    throw error; // Repassa o erro para ser tratado onde foi chamado
  }
};

export default Api;

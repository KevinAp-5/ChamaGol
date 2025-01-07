import axios from "axios";
import { useState } from "react";

const API_URL = "http://192.168.1.9:8080/api/";
let axiosConfig = {
    headers: {
        'Content-Type' : 'application/json; charset=UTF-8',
        'Accept': 'Token',
        "Access-Control-Allow-Origin": "*",
        "Accept-Enconding": "gzip, defiate, br",
    }
  };

// const instance = axios.create({
//   baseURL: API_URL,
//   timeout: 12000,
//   headers: axiosConfig.headers
// });

const Api = async (method, endpoint, data) => {
    console.log(API_URL + endpoint);
    console.log(data);
    try {
        const res = await axios({
            method: method,
            url: API_URL + endpoint,
            headers: axiosConfig,
            timeout: 15000,
            data: data,
        });

        console.log("Response data:", res.data); // Log opcional
        return res; // Retorna a resposta completa
    } catch (error) {
        console.log("Erro de requisição: " + error.message);
        throw error; // Repassa o erro para o chamador lidar
    }
};

export default Api;

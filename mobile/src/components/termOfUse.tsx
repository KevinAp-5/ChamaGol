import { useState } from "react";
import { api, ApiResponse } from '../config/Api';
import { Alert } from "react-native";

export async function fetchTerm(): Promise<string | undefined> {
  try {
    const response = await api.get("terms/latest");

    if (response.status === 200) {
      return (response.data as { content: string })?.content;
    } else {
      Alert.alert("Erro", (response.data as { message: string })?.message || "Erro de requisição.");
      return undefined;
    }
  } catch (error: any) {
    Alert.alert("Erro", error?.response?.data?.message || "Erro de requisição, tente mais tarde.");
    return undefined;
  }
}

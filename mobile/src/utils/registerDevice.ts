// src/utils/registerDevice.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { api } from "../config/Api";

export const registerDevice = async () => {
  try {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      console.log("Permissão de notificação negada");
      return;
    }
    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push token:", expoPushToken);

    // Ensure we send Bearer token explicitly
    const accessToken = await SecureStore.getItemAsync("accessToken");
    if (!accessToken) {
      console.warn(
        "registerDevice: nenhum access token disponível. Abortando registro do device.",
      );
      return;
    }

    console.log("Enviando token para backend com Authorization Bearer");

    const response = await api.post(
      "/devices/register",
      {
        token: expoPushToken,
        platform: Platform.OS.toUpperCase(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    console.log("Device registrado com sucesso.", response.status, response.data);
  } catch (error: any) {
    console.log(
      "Erro ao registrar device:",
      error?.response?.data || error.message,
    );
  }
};
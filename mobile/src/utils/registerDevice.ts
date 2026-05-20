// src/utils/registerDevice.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
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

    await api.post("/devices/register", {
      token: expoPushToken,
      platform: Platform.OS.toUpperCase(),
    });

    console.log("Device registrado com sucesso.");
  } catch (error: any) {
    console.log(
      "Erro ao registrar device:",
      error?.response?.data || error.message,
    );
  }
};
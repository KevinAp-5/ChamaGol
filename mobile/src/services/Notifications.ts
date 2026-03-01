import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import api from "../config/Api";

const PUSH_TOKEN_KEY = "@push_token";

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function getPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
        return null;
    }

    const { status: existingStatus } = 
        await Notifications.getPermissionsAsync();
    
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } =
            await Notifications.requestPermissionsAsync();
        
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("Permissão negada")
        return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    return token;
}

export async function registerDeviceForPush() {
    try {
        const newToken = await getPushToken();

        if (!newToken) return;

        const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

        if (storedToken === newToken) {
            console.log("Push Token já registrado");
            return;
        }

        console.log("Registrando novo push token");

        await api.post("/devices/register", {
            token: newToken,
            platform: Platform.OS
        });

        await AsyncStorage.setItem(PUSH_TOKEN_KEY, newToken);

    } catch (err) {
        console.log("Erro ao registrar push: ", err);
    }

}

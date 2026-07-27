import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThreeDots from '../components/loading';
import Logo from '../components/logo';
import { api } from '../config/Api';
import { useTheme } from '../theme/theme';
import { registerDevice } from '../utils/registerDevice';

const SplashScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tenta buscar info do usuário (usa accessToken salvo)

        const accessToken = await SecureStore.getItemAsync("accessToken");
        if (!accessToken) {
          console.log("nenhum token encontrado para login");
          navigation.replace("Login");
          return;
        }

        const notificationResponse = await Notifications.getLastNotificationResponseAsync();
        const targetScreen = (notificationResponse?.notification?.request?.content?.data as any)?.screen;
        if (targetScreen === "Timeline") {
          console.log("Abrindo Timeline a partir da notificação inicial");
          navigation.replace("Timeline");
          return;
        }

        const data = await api.get(
          "/auth/user/info",
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        if (data?.status == 401 || !data.data) {
          navigation.replace("Login");
          return;
        }

        await registerDevice();
        navigation.replace('Home');
      } catch (err) {
        navigation.replace('Login');
      }
    };
    checkAuth();
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Logo />
        <View style={styles.loadingContainer}>
          <ThreeDots />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  loadingContainer: {
    marginTop: 16,
  },
});

export default SplashScreen;
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThreeDots from '../components/loading';
import Logo from '../components/logo';
import { api } from '../config/Api';
import { registerDevice } from '../utils/registerDevice';

const SplashScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tenta buscar info do usuário (usa accessToken salvo)
        await api.get("/auth/user/info");
        await registerDevice(); // <-- registra o device aqui também!
        navigation.replace('Home');
      } catch (err) {
        // Se falhar (ex: token inválido/expirado), vai para Login
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
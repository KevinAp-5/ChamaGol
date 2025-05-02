import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThreeDots from '../components/loading';
import Logo from '../components/logo';

const SplashScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  useEffect(() => {
    // Simula um carregamento e redireciona para a tela inicial
    const timer = setTimeout(() => {
      navigation.replace('Login'); // Redireciona para a tela de login
    }, 3000); // 3 segundos

    return () => clearTimeout(timer); // Limpa o timer ao desmontar o componente
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Logo></Logo>
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/footer';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={[styles.title, { color: colors.primary }]}>Bem-vindo ao Universo CHAMAGOL</Text>
      <View style={styles.divider} />
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.secondary }]}
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={[styles.cardText, { color: colors.primary }]}>💬 Chat dos torcedores!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.secondary }]}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={[styles.cardText, { color: colors.primary }]}>👥 Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.secondary }]}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={[styles.cardText, { color: colors.primary }]}>ℹ️ Sobre Nós</Text>
      </TouchableOpacity>
      <Footer></Footer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    width: '80%',
    height: 2,
    backgroundColor: '#444',
    marginVertical: 16,
  },
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    width: '80%',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

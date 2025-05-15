import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/footer';
import * as SecureStore from "expo-secure-store";
import { api } from "../config/Api";
import { TermModal } from '../components/term';
import { showCustomAlert } from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [showTermModal, setShowTermModal] = useState(false);

  useEffect(() => {
    const fetchSubcription = async() => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          console.log("erro ao recuperrar o token.");
        }
        const response = await api.get (
          "users/subscription",
          { headers: { Authorization: `Bearer ${token}`}}
        );
        if (response.status === 200 && response.data.userSubscription) {
          try { 
            await AsyncStorage.setItem("subscription", response.data.userSubscription);
            console.log("dados da subscription " + response.data.userSubscription);
          } catch (error) {
            console.log("erro ao salvar dados no asynStorage");
          }
        } else {
          console.log("rtuim");
        }
      } catch (error) {
          console.log("\nerro ao recuperar assinatura do usuário\n-----\n");
      }
    };
    fetchSubcription();
  }, []);

  useEffect(() => {
    const checkTermAcceptance = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) return;
        const response = await api.get(
          "acceptance/has-accepted-latest",
          { headers: {Authorization: `Bearer ${token}`} }
        );
        if (response.status === 200 && response.data === false) {
          setShowTermModal(true);
        }
        if (response.status === 404) {
          showCustomAlert("Erro ao validar usuários, faça login novamente", "Erro");
        }
      } catch (error: any) {
        showCustomAlert("Erro ao verificar aceite dos termos.", "Erro");
      }
    };
    checkTermAcceptance();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={[styles.title, { color: colors.primary }]}>Bem-vindo ao Universo CHAMAGOL</Text>
      <View style={styles.divider} />
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.secondary }]}
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={[styles.cardText, { color: colors.primary }]}>💬 Sinais!</Text>
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
      <TouchableOpacity
        style={[styles.card, { borderColor: colors.secondary }]}
        onPress={() => navigation.navigate('ProSubscription')}
      >
        <Text style={[styles.cardText, { color: colors.primary }]}>💎 Assinaturas</Text>
      </TouchableOpacity>
      <Footer />
      <TermModal
        visible={showTermModal}
        onAccepted={() => setShowTermModal(false)}
      />
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

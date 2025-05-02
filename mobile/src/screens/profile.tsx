import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../config/Api";
import * as SecureStore from "expo-secure-store";
export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = await SecureStore.getItem("accessToken");
      console.log("Token:", token);

      try {
        const response = await api("POST", "/auth/me", { token: token });
        if (response.status === 200 && response.data) {
          setUsername(response.data.name);
          setEmail(response.data.email);
          // Formata a data para dd/MM/yyyy
          const date = new Date(response.data.createdAt);
          const formatted = `${date.getDate().toString().padStart(2, "0")}/${(
            date.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
          setCreated(formatted);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Você tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Modificar Senha",
      "Redirecionando para a tela de modificação de senha..."
    );
    navigation.navigate("RequestPassword");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={[styles.title, { color: colors.primary }]}>Perfil</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.muted }]}>Nome:</Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {username}
          </Text>
          <Text style={[styles.label, { color: colors.muted }]}>E-mail:</Text>
          <Text style={[styles.value, { color: colors.primary }]}>{email}</Text>
          <Text style={[styles.label, { color: colors.muted }]}>
            Data de Registro:
          </Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {created}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.secondary }]}
          onPress={handleChangePassword}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Modificar Senha
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.secondary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.muted }]}>
          © 2025 CHAMAGOL. All Rights Reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});

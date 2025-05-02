import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../components/title";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../config/Api";
import ThreeDots from "../components/loading";

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const response = await api(
        "POST",
        "auth/register",
        { name, "login": email, password }
      );
      if (response.status === 201 || response.status === 200) {
        setLoading(false);
        Alert.alert(
          "Registro realizado!",
          "Verifique seu e-mail para confirmar o cadastro antes de acessar a plataforma.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        setLoading(false);
        Alert.alert("Erro", (response.data as { message: string })?.message || "Erro ao registrar.");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Erro", error?.response?.data?.message || "Erro ao registrar.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Title title="CHAMAGOL" />
          <View
            style={[styles.content, { backgroundColor: colors.background }]}
          >
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: colors.primary }]}>
              Crie sua conta
            </Text>
            <TextInput
              placeholder="Nome"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                { color: colors.primary, borderColor: colors.secondary },
              ]}
            />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                { color: colors.primary, borderColor: colors.secondary },
              ]}
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onChangeText={setPassword}
                value={password}
                style={[
                  styles.input,
                  { color: colors.primary, borderColor: colors.secondary },
                ]}
              />
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={colors.muted}
                style={styles.icon}
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ThreeDots color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Registrar
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.muted }]}>
              © 2025 CHAMAGOL. All Rights Reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 45,
  },
  buttonText: {
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 16,
  },
});

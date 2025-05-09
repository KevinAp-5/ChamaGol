import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import ThreeDots from "../components/loading";
import Logo from "../components/logo";
import Title from "../components/title";
import { api } from "../config/Api";
import { useTheme } from "../theme/theme";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Preencha e-mail e senha.", "Erro");
      return;
    }
    setLoading(true);
    try {
      const response = await api(
        "POST",
        "auth/login",
        { "login": email, "password": password }
      );
      if (response.status === 200 && response.data?.token) {
        await SecureStore.setItemAsync('accessToken', response.data.token);
        navigation.navigate("Home");
      } else {
        showCustomAlert("E-mail ou senha inválidos.", "Erro");
      }
    } catch (error: any) {
      showCustomAlert(error?.response?.data?.message || "Erro ao fazer login.", "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomAlertProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Logo></Logo>
            <Text style={[styles.title, { color: colors.primary }]}>
              Entrar no universo CHAMAGOL
            </Text>
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
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
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
              onPress={() => navigation.navigate("RequestPassword")}
              style={styles.forgotPasswordButton}
            >
              <Text
                style={[styles.forgotPasswordText, { color: colors.highlight }]}
              >
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ThreeDots color={colors.background}/>
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerButton, { borderColor: colors.accent }]}
              onPress={() => navigation.navigate("Register")}
            >
              <Text
                style={[styles.registerButtonText, { color: colors.accent }]}
              >
                Registrar-se
              </Text>
            </TouchableOpacity>
          </View>
          {/* <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.muted }]}>
              © 2025 CHAMAGOL. All Rights Reserved.
            </Text>
          </View> */}
          <Footer></Footer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </CustomAlertProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between", // Garante que o conteúdo e o rodapé fiquem separados
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
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 0,
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
    height: 45, // Altura fixa para evitar mudanças no tamanho
  },
  buttonText: {
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    height: 45, // Altura fixa para evitar mudanças no tamanho
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end", // Alinha o botão à direita
    marginTop: 8,
    marginRight: "1%", // Pequeno espaçamento da borda direita
  },
  forgotPasswordText: {
    fontSize: 14,
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

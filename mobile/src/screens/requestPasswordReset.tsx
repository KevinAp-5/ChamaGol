import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../components/title";
import ThreeDots from "../components/loading";
import { api } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../components/logo";
import { FooterComponent } from "react-native-screens/lib/typescript/components/ScreenFooter";
import Footer from "../components/footer";

export default function RequestPasswordReset({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer para o contador de 60 segundos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && counter > 0) {
      timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
    }
    if (counter === 0) {
      setCanResend(true);
    } else {
      setCanResend(false);
    }
    if (!loading) {
      setCounter(60);
      setCanResend(false);
    }
    return () => clearTimeout(timer);
  }, [loading, counter]);

  const handlePasswordRecovery = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    setCounter(60); // Reinicia o contador ao enviar
    setCanResend(false);
    try {
      // 1. Envia o e-mail para o backend
      const response = await api("POST", "auth/password/forget", { email });
      if (response.status !== 200) {
        throw new Error(response.data?.message || "Erro ao enviar solicitação.");
      }
      Alert.alert("E-mail enviado!", "Verifique sua caixa de entrada e confirme o e-mail.");
      await AsyncStorage.setItem("email", email);

      // 2. Inicia o polling para verificar se o e-mail foi confirmado
      await waitForEmailConfirmation(email);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Polling: verifica se o e-mail foi confirmado no backend
  const waitForEmailConfirmation = async (email: string) => {
    let attempts = 0;
    const maxAttempts = 25;
    await delay(5000); // Espera 5 segundos antes de começar a verificar

    while (attempts < maxAttempts) {
      try {
        const response = await api("POST", "auth/email/confirmed", { email });
        // O backend retorna { message: "email activated." } se confirmado
        if (
          response.status === 200 &&
          typeof response.data?.message === "string" &&
          response.data.message.trim().toLowerCase() === "email activated."
        ) {
          // Alert.alert("Sucesso", "E-mail confirmado com sucesso!");
          navigation.navigate("PasswordResetEmailConfirmed");
          return;
        }
      } catch (error: any) {
        // Se não confirmado, ignora e tenta novamente
      }
      await delay(5000);
      attempts++;
    }
    Alert.alert(
      "Atenção",
      "Confirmação de e-mail não concluída a tempo. Tente novamente."
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleError = (error: any) => {
    if (!error.response) {
      Alert.alert(
        "Erro",
        error.message || "Erro desconhecido. Tente novamente."
      );
      return;
    }
    const { status, data } = error.response;
    const message = data?.message || "Tente novamente mais tarde.";
    switch (status) {
      case 400:
        Alert.alert("Erro de Validação", message);
        break;
      default:
        Alert.alert(
          "Erro Desconhecido",
          `Status: ${status || "N/A"} - ${message}`
        );
        break;
    }
  };

  return (
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
              Recuperação de Senha
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Insira seu e-mail para receber um link de recuperação de senha.
            </Text>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                { color: colors.primary, borderColor: colors.secondary },
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              />
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: canResend || !loading ? colors.secondary : colors.muted },
              ]}
              onPress={handlePasswordRecovery}
              disabled={loading && !canResend}
            >
              {loading && !canResend ? (
                <ThreeDots color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  {canResend ? "Reenviar e-mail" : "Confirmar"}
                </Text>
              )}
            </TouchableOpacity>
            {loading && counter > 0 && (
              <Text style={{ color: colors.muted, marginTop: 12 }}>
                Aguardando confirmação do e-mail... ({counter}s)
              </Text>
            )}
            {canResend && (
              <Text style={{ color: colors.secondary, marginTop: 12 }}>
                Não recebeu o e-mail? Você pode reenviar agora.
              </Text>
            )}
          </View>
          <Footer></Footer>
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
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
});
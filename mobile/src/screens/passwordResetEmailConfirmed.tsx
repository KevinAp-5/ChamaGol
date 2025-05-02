import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../components/title";

const PasswordResetEmailConfirmed = ({ navigation }: any) => {
  const { colors } = useTheme();

  const handleGoToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
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
            <View style={styles.iconContainer}>
            <Image
              source={require("../assets/check-icon.png")} // Substitua pelo caminho correto do ícone
              style={styles.icon}
            />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>
              E-mail Confirmado!
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Seu e-mail foi confirmado com sucesso. Você já pode redefinir sua senha.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary }]}
              onPress={handleGoToForgotPassword}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Redefinir Senha
              </Text>
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
};

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
  icon: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 0,
    marginLeft: 10
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111",
    borderRadius: 100,
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
    height: 45, // Altura fixa para evitar mudanças no tamanho
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
});

export default PasswordResetEmailConfirmed;
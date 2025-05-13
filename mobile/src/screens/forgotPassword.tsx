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
  Image,
  Alert,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Title from "../components/title";
import ThreeDots from "../components/loading";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "../components/footer";

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    AsyncStorage.getItem("email").then((savedEmail) => {
      if (savedEmail) setEmail(savedEmail);
    });
  }, []);

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (!email) {
      Alert.alert("Erro", "E-mail não encontrado. Tente novamente o fluxo de recuperação.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(
        "auth/password/reset",
        { email, password: newPassword }
      );
      if (response.status === 200) {
        setLoading(false);
        Alert.alert('Sucesso', 'Sua senha foi redefinida com sucesso.');
        navigation.navigate('Login');
      } else {
        setLoading(false);
        Alert.alert("Erro", response.data?.message || "Erro ao redefinir a senha.");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Erro", error?.response?.data?.message || "Ocorreu um erro inesperado.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
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
            <Image
              source={require("../assets/reseticon.png")}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: colors.primary }]}>
              Redefinir Senha
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Insira sua nova senha e confirme para redefinir.
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Nova senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={newPassword}
                onChangeText={setNewPassword}
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
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirmar Senha"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
              onPress={handlePasswordReset}
              disabled={loading}
            >
              {loading ? (
                <ThreeDots color={colors.background}/>
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Confirmar
                </Text>
              )}
            </TouchableOpacity>
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
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 50,
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
import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import ThreeDots from "../../../components/treedots";
import Title from "../../../components/Title";
import { validateEmail, validatePassword } from "../../../utilities/validations";
import styles from "./style";

// Defina a URL da API para login (ajuste conforme necessário)
const API_URL = "http://192.168.1.7:8080/api/auth/login";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validações em tempo real para email e senha
  const emailValidate = (input) => {
    setEmail(input);
    if (!input) {
      setError("Insira o email");
    } else if (!validateEmail(input)) {
      setError("Email inválido");
    } else {
      setError("");
    }
  };

  const passwordValidate = (input) => {
    setPassword(input);
    if (!input) {
      setError("Insira a senha");
    } else if (!validatePassword(input)) {
      setError("A senha deve ter pelo menos 8 caracteres");
    } else {
      setError("");
    }
  };

  const applyValidations = () => {
    if (!validateEmail(email)) {
      setError("Email inválido");
      return false;
    }
    if (!validatePassword(password)) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return false;
    }
    setError("");
    return true;
  };

  // Função que realiza o login utilizando axios
  const handleLogin = async () => {
    if (!applyValidations()) return;

    setLoading(true);

    const userData = { email, senha: password };

    try {
      const response = await axios.post(API_URL, userData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Se você utiliza algum serviço de Analytics, descomente a linha abaixo:
      // await Analytics.logEvent("user_login", { user_id: user.id, email: user.email });

      navigation.replace("Timeline", { user: response.data });
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para tratar os erros da API
  const handleApiError = (error) => {
    const status = error.response?.status;
    const message = error.response?.data || error.message;

    switch (status) {
      case 400:
        Alert.alert("Erro de Validação", "Dados inválidos enviados ao servidor.");
        break;
      case 401:
        Alert.alert("Erro de Login", "Email ou senha inválida.");
        break;
      case 403:
        Alert.alert("Acesso Negado", "Confirme o email para poder entrar!");
        break;
      case 404:
        Alert.alert("Erro", message || "Recurso não encontrado.");
        break;
      case 500:
        Alert.alert("Erro no Servidor", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
        break;
      case 502:
        Alert.alert("Erro ao Enviar E-mail", "Houve um problema ao enviar o e-mail. Tente novamente mais tarde.");
        break;
      default:
        Alert.alert("Erro", `Status: ${status} - ${message || "Tente novamente mais tarde."}`);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      {/* Envolvendo o conteúdo com ScrollView para permitir scroll com o teclado ativo */}
      <ScrollView contentContainerStyle={styles.formContext} keyboardShouldPersistTaps="handled">
        <Pressable onPress={Keyboard.dismiss} style={{ width: "100%", alignItems: "center" }}>
          <Text style={styles.titleText}>LOGIN</Text>
          <View style={styles.form}>
            <Text style={styles.formLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={emailValidate}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Apenas os campos necessários foram mantidos para padronizar com o registro */}
            <Text style={styles.formLabel}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { width: "85%", margin: 0, backgroundColor: "transparent", borderWidth: 0 }]}
                value={password}
                onChangeText={passwordValidate}
                placeholder="Digite sua senha"
                placeholderTextColor="#666"
                keyboardType="default"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
              />
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#666"
                style={styles.icon}
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>
          </View>

          {error ? (
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ThreeDots /> : <Text style={styles.buttonText}>ENTRAR</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("EmailInput")} style={{ marginTop: 20 }}>
            <Text style={[styles.buttonText, { color: "#6D9773" }]}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
            <Text style={[styles.buttonText, { color: "#6D9773" }]}>Cadastre-se</Text>
          </TouchableOpacity>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

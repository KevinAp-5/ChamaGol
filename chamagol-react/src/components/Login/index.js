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
  AsyncStorage
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ThreeDots from "../treedots/";
import Api from "../../config/Api";
import Title from "../Title";
import { validateEmail, validatePassword } from "../Utilities/validations";
import styles from "./style";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Controle de loading

  const handleLogin = async () => {
    applyValidations();

    if (error) return;

    setLoading(true);
    try {
      await fetchData({ email, senha: password });
    } catch (e) {
      console.log("Erro de autenticação:", e);
    } finally {
      setLoading(false);
    }

  };

  const fetchData = async (data) => {
    try {
      const res = await Api("POST", "auth/login", data);
      console.log("Dados recebidos:", res.data);

      const { token, user: refreshToken } = res.data;

      // Salva o token e informações do usuário
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(refreshToken));

      // Loga o evento de login
      await Analytics.logEvent("user_login", {
        user_id: refreshToken.id,
        email: refreshToken.email,
      });

      // Redireciona para a timeline após login bem-sucedido
      navigation.replace("Timeline", { user: res.data });
    } catch (error) {
      const { status, data } = error.response;

      // Lida com cada status code
      switch (status) {
        case 400: // Bad Request
          Alert.alert(
            "Erro de Validação",
            data || "Dados inválidos enviados ao servidor.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        case 401: // Unauthorized
          Alert.alert(
            "Erro de Login",
            "Email ou senha inválida.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        case 403: // Forbidden
          Alert.alert(
            "Acesso Negado",
            "Você não tem permissão para acessar este recurso.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        case 404: // Not Found
          Alert.alert(
            "Erro",
            data || "Recurso não encontrado.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        case 500: // Internal Server Error
          Alert.alert(
            "Erro no Servidor",
            "Ocorreu um erro inesperado. Tente novamente mais tarde.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        case 502: // Bad Gateway
          Alert.alert(
            "Erro ao Enviar E-mail",
            "Houve um problema ao enviar o e-mail. Tente novamente mais tarde.",
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;
        default: // Outros status não tratados
          Alert.alert(
            "Erro Desconhecido",
            `Status: ${status} - ${data || "Tente novamente mais tarde."}`,
            [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          );
          break;

      }
    }
  };

  const handleRegister = () => navigation.navigate("Register");

  const passwordReset = () => navigation.navigate("EmailInput");

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
      return;
    }
    if (!validatePassword(password)) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    setError("");
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>LOGIN</Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={emailValidate}
            placeholder="Digite seu e-mail"
            placeholderTextColor="black"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={passwordValidate}
              placeholder="Digite sua senha"
              placeholderTextColor="black"
              keyboardType="default"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>
        </View>
        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        {/* Botão de Login */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ThreeDots /> : <Text style={styles.buttonText}>ENTRAR</Text>}
        </TouchableOpacity>

        {/* Esqueceu a Senha */}
        <TouchableOpacity onPress={passwordReset}>
          <View style={styles.resetPasswordContext}>
            <Text style={styles.resetPasswordText}>Esqueceu a senha?</Text>
          </View>
        </TouchableOpacity>

        {/* Cadastro */}
        <TouchableOpacity onPress={handleRegister}>
          <View style={styles.registerContext}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </View>
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
};

export default Login;

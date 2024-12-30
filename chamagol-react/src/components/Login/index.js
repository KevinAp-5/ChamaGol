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

          await AsyncStorage.setItem("token", token);
          await AsyncStorage.setItem("user", JSON.stringify(refreshToken));
  
          // Loga o evento de login
          await Analytics.logEvent("user_login", {
              user_id: refreshToken.id,
              email: refreshToken.email,
          });
  
          // Handle successful login (e.g., navigate to the home screen)
          navigation.replace("Timeline", { user: res.data });
      } catch (error) {
          if (error.response) {
              const { status, statusText } = error.response;
  
              // Check for 401 Unauthorized and show popup
              if (status === 401) {
                  Alert.alert(
                      "Erro de Login",
                      "Email ou senha inválida.",
                      [{ text: "OK", onPress: () => console.log("Popup fechado") }],
                      { cancelable: true }
                  );
              } else {
                  Alert.alert(
                      "Erro!",
                      statusText,
                      [{ text: "OK", onPress: () => console.log("Popup fechado") }]
                  );
              }
          // } else {
          //     // Handle network or connection issues
          //     Alert.alert(
          //         "Erro de Conexão",
          //         "Não foi possível conectar ao servidor. Verifique sua conexão.",
          //         [{ text: "OK", onPress: () => console.log("Popup fechado") }]
          //     );
          }
      }
  };
  

  // const fetchData = async (data) => {
  //   try {
  //     const res = await Api("POST", "auth/login", data);
  //     console.log("Dados recebidos:", res.data);
  //       const { token, refreshToken } = res.data;

  //       // Salva o token e os dados do usuário
  //       await AsyncStorage.setItem("token", token);
  //       await AsyncStorage.setItem("refreshToken", JSON.stringify(refreshToken));

  //   } catch (error) {
  //     console.log("Erro ao acessar API:", error.message);
  //   }
  // };

  const handleRegister = () => navigation.navigate("Register");

  const passwordReset = () => navigation.navigate("ResetPassword");

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

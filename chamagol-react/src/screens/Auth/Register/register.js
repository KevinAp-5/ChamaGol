import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Keyboard,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import CheckBox from "expo-checkbox";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import styles from "./style";
import { validateEmail, validateName, validatePassword } from "../../../components/Utilities/validations";
import Title from "../../../components/Title";
import ThreeDots from "../../../components/treedots";
import lgpd_text from "./lgpd";

const API_URL = "http://192.168.1.7:8080/api/auth/register";

const Register = ({ navigation }) => {
  // Estados dos campos e de seus erros
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Estado para erro global (por exemplo, termos não aceitos)
  const [globalError, setGlobalError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validações em tempo real
  const handleNameChange = (text) => {
    setName(text);
    if (!validateName(text)) {
      setNameError("Nome inválido.");
    } else {
      setNameError("");
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (!validateEmail(text)) {
      setEmailError("Email inválido.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!validatePassword(text)) {
      setPasswordError("Senha inválida.");
    } else {
      setPasswordError("");
    }
  };

  // Validação final do formulário antes de enviar
  const validateForm = () => {
    let valid = true;
    let errorMessage = "";

    if (!isTermsAccepted) {
      errorMessage = "Você precisa aceitar os Termos de Uso para continuar.";
      valid = false;
    }

    if (!validateName(name)) {
      errorMessage = "Nome inválido.";
      valid = false;
    }

    if (!validateEmail(email)) {
      errorMessage = "Email inválido.";
      valid = false;
    }

    if (!validatePassword(password)) {
      errorMessage = "Senha inválida.";
      valid = false;
    }

    setGlobalError(errorMessage);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const userData = {
      nome: name,
      email: email,
      senha: password,
      assinatura: "AMADOR",
    };

    try {
      const response = await axios.post(API_URL, userData, {
        headers: { "Content-Type": "application/json" },
      });

      Alert.alert("Sucesso", "Usuário registrado com sucesso!\nConfirme o email para entrar.");
      navigation.navigate("Login");
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        Alert.alert("Erro de Validação", "Dados inválidos enviados ao servidor.");
        break;
      case 409:
        Alert.alert("Erro de Registro", "Email já cadastrado.");
        break;
      case 500:
        Alert.alert("Erro no Servidor", "Erro no servidor. Tente novamente.");
        break;
      default:
        Alert.alert("Erro", "Erro desconhecido. Tente novamente mais tarde.");
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>REGISTRO</Text>

        <View style={styles.form}>
          {/* Campo Nome */}
          <Text style={styles.formLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Nome completo"
            placeholderTextColor="gray"
            keyboardType="default"
          />
          {nameError ? (
            <Text style={styles.errorMessage}>{nameError}</Text>
          ) : null}

          {/* Campo Email */}
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Seu email*"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <Text style={styles.errorMessage}>{emailError}</Text>
          ) : null}

          {/* Campo Senha */}
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Digite uma senha"
              secureTextEntry={!showPassword}
              placeholderTextColor="gray"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={() => setShowPassword(!showPassword)}
            />
          </View>
          {passwordError ? (
            <Text style={styles.errorMessage}>{passwordError}</Text>
          ) : null}

          {/* Termos */}
          <View style={styles.termsContainer}>
            <CheckBox value={isTermsAccepted} onValueChange={setIsTermsAccepted} />
            <Text style={styles.termsText}>
              Eu aceito os{" "}
              <Text
                style={styles.link}
                onPress={() => Alert.alert("Termos de Uso", lgpd_text)}
              >
                Termos de Uso
              </Text>
              .
            </Text>
          </View>

          {/* Erro global */}
          {globalError ? (
            <View style={styles.errorMessageContext}>
              <Text style={styles.errorMessage}>{globalError}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, !isTermsAccepted && { backgroundColor: "gray" }]}
          onPress={handleRegister}
          disabled={!isTermsAccepted || loading}
        >
          {loading ? <ThreeDots /> : <Text style={styles.buttonText}>CONFIRMAR</Text>}
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
};

export default Register;

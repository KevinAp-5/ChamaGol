import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Platform,
  Keyboard,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from "react-native";
import CheckBox from "expo-checkbox";
import styles from "./style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { validateEmail, validateName, validatePassword } from "../Utilities/validations";
import Api from "../../config/Api"; // Configuração do endpoint
import Title from "../Title/";
import "@expo/metro-runtime";
import lgpd_text from "./lgpd";
import ThreeDots from "../treedots";

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!isTermsAccepted) {
      Alert.alert(
        "Atenção",
        "Você precisa aceitar os Termos de Uso para continuar. Estes termos explicam como coletamos e usamos seus dados em conformidade com a LGPD."
      );
      return;
    }

    applyValidations();

    if (error) return;

    setLoading(true);
    const datauser = { nome: name, email: email, senha: password, assinatura: "AMADOR" };
    try {
      const response = await Api("POST", "auth/register", datauser);
      Alert.alert("Sucesso", "Usuário registrado com sucesso!\nConfime o email para entrar.");
      navigation.navigate("Login");
    } catch (err) {
      const { status, data } = err.response || {};
      let message = "Erro desconhecido. Tente novamente mais tarde.";

      if (status === 400) message = "Dados inválidos enviados ao servidor.";
      else if (status === 409) message = "Email já cadastrado.";
      else if (status === 500) message = "Erro no servidor. Tente novamente.";

      Alert.alert("Erro de Registro", message);
    } finally {
      setLoading(false);
    }
  };

  const nameValidate = (input) => {
    setName(input);
    if (!validateName(input)) {
      setError("Formato inválido");
    } else {
      setError("");
    }
  };

  const emailValidate = (input) => {
    setEmail(input);
    if (!validateEmail(input)) {
      setError("Email inválido");
    } else {
      setError("");
    }
  };

  const passwordValidate = (input) => {
    setPassword(input);
    if (!validatePassword(input)) {
      setError("A senha deve ter pelo menos 8 caracteres");
    } else {
      setError("");
    }
  };

  const applyValidations = () => {
    if (!validateEmail(email) || !validateName(name) || !validatePassword(password)) {
      setError("Preencha os campos corretamente.");
      return;
    }
    setError("");
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>REGISTRO</Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={nameValidate}
            placeholder="Nome completo"
            placeholderTextColor="gray"
            keyboardType="default"
          />

          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={emailValidate}
            placeholder="Seu email*"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={passwordValidate}
              placeholder="Digite uma senha"
              secureTextEntry={!showPassword}
              placeholderTextColor="gray"
              keyboardType="default"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>

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

          {error ? (
            <View style={styles.errorMessageContext}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, !isTermsAccepted && { backgroundColor: "gray" }]}
          onPress={handleRegister}
          disabled={!isTermsAccepted || loading}
        >
          {loading ? <ThreeDots /> : <Text style={styles.buttonText}>  CONFIRMAR</Text>}
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
};

export default Register;

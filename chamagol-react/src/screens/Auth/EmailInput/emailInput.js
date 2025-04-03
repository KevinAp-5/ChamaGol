import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  AsyncStorage,
} from "react-native";
import ThreeDots from "../../../components/treedots";
import styles from "./style";
import Title from "../../../components/Title";
import Api from "../../../config/Api";

const emailIcon = require("../../../../assets/images/mail.png");
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const EmailInput = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!validateEmail(email))
      return Alert.alert("Erro", "Por favor, insira um e-mail válido.");

    try {
      setLoading(true);
      await sendPasswordResetRequest(email);
      await waitForEmailConfirmation(email);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      await AsyncStorage.setItem("email", email);
    }
  };

  const sendPasswordResetRequest = async (email) => {
    const response = await Api("POST", "auth/password/reset", { email });
    if (response.status !== 200) throw new Error("Erro ao enviar solicitação.");
    Alert.alert("E-mail enviado!", "Verifique na sua caixa de entrada.");
  };

  const waitForEmailConfirmation = async (email) => {
    let attempts = 0;
    const maxAttempts = 18;

    await delay(5000); // Espera 5 segundos antes de começar a verificar
    while (attempts < maxAttempts) {
      const status = await getUserStatus(email);
      if (status === "ACTIVE") {
        navigation.navigate("EmailConfirmation", { email });
        return; // Sai do loop e encerra a função
      }
      await delay(5000);
      attempts++;
    }

    throw new Error("Confirmação de e-mail não concluída a tempo.");
  };

  const getUserStatus = async (email) => {
    const response = await Api("POST", "auth/email/confirmed", {
      email: email,
    });
    const result = response.data.trim();
    const [, status] = result.split(":");
    return status;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleError = (error) => {
    if (!error.response) {
      Alert.alert(
        "Erro",
        error.message || "Erro desconhecido. Tente novamente."
      );
      return;
    }

    const { status, data } = error.response;
    const message = data || "Tente novamente mais tarde.";

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
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <View style={styles.formContext}>
        <Image source={emailIcon} style={styles.icon} />
        <Text style={styles.titleText}>Recuperar Senha</Text>
        <Text style={styles.subtitleText}>
          Insira seu e-mail abaixo para receber o link de redefinição de senha.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendEmail}
          disabled={loading}
        >
          {loading ? (
            <ThreeDots />
          ) : (
            <Text style={styles.buttonText}>ENVIAR E-MAIL</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.tipText}>
          Caso não encontre o e-mail, verifique a sua caixa de spam.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default EmailInput;

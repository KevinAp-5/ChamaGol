import React, { useState } from "react";
import { 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  Keyboard, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  Alert,
  AsyncStorage
} from "react-native";
import { validatePassword, validatePasswordsMatch } from "../../../utilities/validations";
import styles from "./style";
import Title from "../../../components/Title";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Api from "../../../config/Api";
import ThreeDots from "../../../components/treedots"; // Importação do componente de carregamento

const ResetPassword = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Controle de visibilidade da senha
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Controle de visibilidade da confirmação de senha
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const { email } = route.params || {}; // Obtenha o email da rota, se disponível

  const navigateHome = async () => {
    getEmail();
    try {
      setLoading(true); // Ativa o estado de carregamento
      // await new Promise((r) => setTimeout(r, 5000));
      await sendRequestResetPassword({ email: email, novaSenha: confirmPassword });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
    navigation.navigate("Login");
  };

  const getEmail = async () => {
    const userEmail = await AsyncStorage.getItem("email");
    console.log(userEmail);
    setEmail(userEmail);
  };

  const handleConfirm = () => {
    if (!validatePasswordsMatch(password, confirmPassword)) {
      setError("As senhas não coincidem.");
      return false;
    }
    navigateHome();
  };

  const sendRequestResetPassword = async (data) => {
    const response = await Api("POST", "auth/password/reset/confirm", data);
    if (response.status != 200) throw new Error("Erro ao trocar as senhas");
    Alert.alert("Sucesso!", "Senha foi alterada com sucesso.");
  };

  const handleError = (error) => {
    if (!error.response) {
      Alert.alert("Error", error.message || "Erro desconhecido. Tente novamente.");
      return;
    }

    const { status, data } = error.response;
    const message = data || "Tente novamente mais tarde.";

    switch (status) {
      case 401:
        Alert.alert("Erro de validação", message);
        break;
      case 500:
        Alert.alert("Dados inválidos", message);
        break;
      default:
        Alert.alert("Erro", message);
        break;
    }
  };

  const passwordValidate = (input) => {
    setPassword(input);
    if (!input) {
      setError("Insira a senha.");
      return;
    }
    if (!validatePassword(input)) {
      setError("A senha deve conter pelo menos 8 caracteres.");
    } else {
      setError("");
    }
  };

  const passwordsMatch = (input) => {
    setConfirmPassword(input);
    if (!validatePasswordsMatch(password, input)) {
      setError("As senhas não coincidem.");
    } else {
      setError("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Image source={require("../../../../assets/images/reseticon.png")} style={styles.topImage} />
        <Text style={styles.titleText}>Recuperar senha</Text>
        <Text style={styles.subtitleText}>
          Crie uma nova senha para sua conta. Certifique-se de que seja forte.
        </Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={passwordValidate}
              placeholder="Digite uma nova senha"
              secureTextEntry={!showPassword} // Controla a visibilidade da senha
              placeholderTextColor="black"
              keyboardType="default"
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

          <Text style={styles.formLabel}>Confirme a senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={passwordsMatch}
              placeholder="Confirme sua nova senha"
              secureTextEntry={!showConfirmPassword} // Controla a visibilidade da confirmação de senha
              placeholderTextColor="black"
              keyboardType="default"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </View>
        </View>
        {error ? (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.button} onPress={handleConfirm} disabled={loading}>
          {loading ? <ThreeDots /> : <Text style={styles.buttonText}>CONFIRMAR</Text>}
        </TouchableOpacity>
      </Pressable>
    </SafeAreaView>
  );
};

export default ResetPassword;

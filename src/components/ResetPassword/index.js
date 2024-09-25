import React, { useState } from "react";
import {Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { validatePassword, validatePasswordsMatch } from "../Utilities/validations";
import styles from "./style";
import Title from "../Title/"
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ResetPassword = ({navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false); // Controle de visibilidade da senha
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Controle de visibilidade da confirmação de senha

  const navigateHome = () => {
      navigation.navigate("Login");
  }

  const handleConfirm = () => {
    // verify if account exists
    if (!validatePasswordsMatch(password, confirmPassword)) {
      setError("senhas inválidas")
      return false
    }
    navigateHome()
    // update password
  }

  const passwordValidate = (input) => {
    setPassword(input)
    if (!input) {
      setError('Insira a senha')
      return;
    }
    if (!validatePassword(input)) {
      setError('A senha contém 8 caracteres')
    }
    else {
      setError('')
    }
  };

  const passwordsMatch = (input) => {
      setConfirmPassword(input);
      if (!validatePasswordsMatch(password, input)) {
        setError("As senhas não são iguais")
      } else {
        setError('');
      }
    };

  // Alterna a visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Alterna a visibilidade da confirmação de senha
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar 
        animated={true}
        backgroundColor="#000000"
        barStyle='dark-content'
      />
      <Title title="CHAMAGOL"/>
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>Recuperar senha</Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={passwordValidate}
              placeholder="Digite uma senha"
              secureTextEntry={!showPassword}  // Controla a visibilidade da senha
              placeholderTextColor="black"
              keyboardType="default"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>

          {/* Campo de Confirmar Senha com Ícone */}
          <Text style={styles.formLabel}>Confirme a senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={passwordsMatch}
              placeholder="Confirme sua senha"
              secureTextEntry={!showConfirmPassword}  // Controla a visibilidade da confirmação de senha
              placeholderTextColor="black"
              keyboardType="default"
              autoCapitalize="none"
            />
            <MaterialCommunityIcons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowConfirmPassword}
            />
          </View>

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

        </View>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>CONFIRMAR</Text>
        </TouchableOpacity>

        
        </Pressable>
      </SafeAreaView>
  );
}

export default ResetPassword;
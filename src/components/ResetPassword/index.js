import React, { useState } from "react";
import {Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableOpacity
} from "react-native";
import { validatePassword, validatePasswordsMatch } from "../Utilities/validations";
import styles from "./style";
import Title from "./Title/"

const ResetPassword = ({navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')

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

  return (
    <View style={styles.container}>
      <Title title="CHAMAGOL"/>
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>Recuperar senha</Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>Nova senha</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={passwordValidate}
            placeholder="Digite uma senha"
            placeholderTextColor="black"
            keyboardType="default"
            autoCapitalize="none"
          />

          <Text style={styles.formLabel}>Confirmar senha</Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={passwordsMatch}
            placeholder="Repita a senha"
            placeholderTextColor="black"
            keyboardType="default"
            autoCapitalize="none"
            secureTextEntry
          />
          </View>

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>CONFIRMAR</Text>
          </TouchableOpacity>
        </Pressable>
      </View>
  );
}

export default ResetPassword;
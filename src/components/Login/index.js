import React, { useState } from "react";
import {Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableOpacity
} from "react-native";
import styles from "./style";
import { validateEmail, validatePassword } from "../Utilities/validations";
import Title from "./Title";

const Login = ({navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')

  const handleLogin = () => {
    // verify if account exists
    navigation.navigate('Register');
  }

  const emailValidate = (input) => {
    setEmail(input)
    if (!input) {
      setError('insira o email')
      return;
    }

    if (!validateEmail(input)) {
      setError('')
    }
    else {
      setError('email inválido')
    }
  };

  const passwordValidate = (input) => {
    setPassword(input)
    if (!input) {
      setError('Insira a senha')
      return;
    }
    if (!validatePassword(input)) {
      setError('senha deve ter pelo menos 8 caracteres')
    }
    else {
      setError('')
    }
  };

  const passwordReset = () => {
    navigation.navigate('passwordReset')
  };

  return (
    <View style={styles.container}>
      <Title title="CHAMAGOL"/>
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <Text style={styles.titleText}>LOGIN</Text>
        <View style={styles.form}>
          <Text style={styles.formLabel}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={emailValidate}
            placeholder="Seu email*"
            placeholderTextColor="black"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.formLabel}>Senha</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={passwordValidate}
            placeholder="Digite uma senha"
            placeholderTextColor="black"
            keyboardType="default"
            autoCapitalize="none"
            secureTextEntry
          />
          </View>

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={passwordReset}>
            <View style={styles.resetPasswordContext}>
              <Text style={styles.resetPasswordText}>Esqueceu a senha?</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={null}>
            <View style={styles.registerContext}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </View>
          </TouchableOpacity>

        </Pressable>
      </View>
  );
}

export default Login;
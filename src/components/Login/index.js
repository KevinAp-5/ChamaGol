import React, { useState } from "react";
import {Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import styles from "./style";
import { validateEmail, validatePassword } from "../Utilities/validations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Title from "./Title";

const Login = ({navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // verify if account exists
    navigation.navigate('Timeline');
  }

  const handleRegister= () => {
    navigation.navigate('Register')
  }

  const emailValidate = (input) => {
    setEmail(input)
    if (!input) {
      setError('insira o email')
      return;
    }

    if (validateEmail(input)) {
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
    navigation.navigate('ResetPassword')
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  }

  return (
    <SafeAreaView style={styles.container}>
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

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={passwordValidate}
              placeholder="Digite uma senha"
              placeholderTextColor="black"
              keyboardType="default"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
            />
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#aaa"
              style={styles.icon}
              onPress={toggleShowPassword}
            />
          </View>
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
            onPress={handleRegister}>
            <View style={styles.registerContext}>
              <Text style={styles.registerText}>Cadastre-se</Text>
            </View>
          </TouchableOpacity>

        </Pressable>
      </SafeAreaView>
  );
}

export default Login;
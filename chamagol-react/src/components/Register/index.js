import React, { useState } from "react";
import { Text, View, TextInput, Platform, Keyboard, Pressable, TouchableOpacity, SafeAreaView } from "react-native";
import styles from "./style";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Ícones de olho
import { validateEmail, validateName, validatePassword } from "../Utilities/validations";
import Title from "../Title/";

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Controle de visibilidade da senha

  const handleRegister = () => {
    applyValidations()
    navigation.navigate('Home');
  };

  const nameValidate = (input) => {
    setName(input);
    if (!validateName(input)) {
      setError('Formato inválido');
    } else {
      setError('');
    }
  };

  const emailValidate = (input) => {
    setEmail(input);
    if (!validateEmail(input)) {
      setError('Email inválido');
    } else {
      setError('');
    }
  };

  const passwordValidate = (input) => {
    setPassword(input);
    if (!validatePassword(input)) {
      setError('A senha deve ter pelo menos 8 caracteres');
    } else {
      setError('');
    }
  };

  const applyValidations = () => {
    /* Will apply the validations one more time before sending data */
    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }

    if (!validateName(name)) {
      setError('Nome inválido')
      return;
    }
 
    if (!validatePassword(password)) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setError('')
  }

  const goToLogin = () => {
    navigation.navigate("Login");
  }

  // Alterna a visibilidade da senha
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL"/>
      <Pressable
        onPress={Keyboard.dismiss}
        style={styles.formContext}
        behavior={Platform.OS === "ios" ? 'padding' : 'height'}
      >
        <Text style={styles.titleText}>REGISTRO</Text>
        <View style={styles.form}>

          <Text style={styles.formLabel}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={nameValidate}
            placeholder="Nome completo"
            placeholderTextColor="black"
            keyboardType="default"
          />

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

          {/* Campo de Senha com Ícone */}
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

          {/* Exibição de Erros */}
          {error ? 
            <View style={styles.errorMessageContext}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          : null}

        </View>
        {/* Botão de Registro */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>CONFIRMAR</Text>
        </TouchableOpacity>

        {/* Botão de login para quem tiver cadastro */}
        <View style={styles.loginContext}>
          <Text style={styles.loginText}>Já possui uma conta? </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.LoginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>

      </Pressable>
    </SafeAreaView>
  );
};

export default Register;

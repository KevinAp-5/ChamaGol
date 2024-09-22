import React, { useState } from "react";
import { Text, View, TextInput, Platform, Keyboard, Pressable, TouchableOpacity } from "react-native";
import styles from "./style";
import { validateEmail, validateName, validatePassword, validatePasswordsMatch } from "../Utilities/validations";
import Title from "./Title/"

const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = () => {
    if (!validateEmail(email)) {
      setError('Email inválido');
      return;
    }
 
    if (!validatePassword(password)) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (!validatePasswordsMatch(password, confirmPassword)) {
      setError('As senhas não coincidem');
      return;
    }

    // Se as validações passarem, navega para a Timeline
    setError('');
    navigation.navigate('HomeScreen');
  };

  const nameValidate = (input) => {
    setName(input);
    if (!validateName(input)) {
      setError('Formato inválido')
    } else {
      setError('')
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
      <Pressable
        onPress={Keyboard.dismiss}
        style={styles.formContext}
        behavior={Platform.OS === "ios" ? 'padding': 'height'}
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

          <Text style={styles.formLabel}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={passwordValidate}
            placeholder="Digite uma senha"
            secureTextEntry
            placeholderTextColor="black"
            keyboardType="default"
            autoCapitalize="none"
          />

          <Text style={styles.formLabel}>Confirme a senha</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={passwordsMatch}
            placeholder="Confirme sua senha"
            secureTextEntry
            placeholderTextColor="black"
            keyboardType="default"
            autoCapitalize="none"
          />
  
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>CONFIRMAR</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );
}

export default Register;

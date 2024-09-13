import React, { useState } from "react";
import {Text, View, TextInput} from "react-native";
import Title from "../Title";
import styles from "./style";
import validator from "validator";
import LoginButton from "./LoginButton"

const Login = ({navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(null);
    const [error, setError] = useState(null)

    const handleLogin = () => {
      navigation.navigate('Timeline');
    }

    const validateEmail = (input) => {
      setEmail(input)
      if (!input) {
        setError('insira o email')
        return;
      }

      if (validator.isEmail(input)) {
        setError('')
      }
      else {
        setError('email inválido')
      }
    };

    const validatePassWord = (input) => {
      setPassword(input)
      if (!input) {
        setError('Insira a senha')
        return;
      }
      if (input.length < 8) {
        setError('A senha precisa de 8 caractéres')
      }
      else {
        setError('')
      }
    };

    return (
      <View style={styles.container}>
        <Title/>
        <View style={styles.form}>
          <Text style={styles.formLabel}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={validateEmail}
            placeholder="Seu email*"
            placeholderTextColor="black"
            keyboardType="default"
          />

          {error !== null && (
            error ? (
              <Text style={styles.invalidMark}>✗</Text>
            ) : (
              <Text style={styles.validMark}>✓</Text>
            )
          )}

          <Text style={styles.formLabel}>Senha</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={validatePassWord}
            placeholder="Digite uma senha"
            placeholderTextColor="black"
            keyboardType="default"
          />
          </View>
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
          <LoginButton onPress={handleLogin}/>
        </View>
    );
}

export default Login;
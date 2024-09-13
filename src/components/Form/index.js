import React, { useState } from "react";
import {Text, View, TextInput} from "react-native";
import Title from "../Title/index";
import styles from "./style";
import validator from "validator";
import loginButton from "./LoginButton"

export default function Login(navigation) {
    const [nome, setNome] = useState('');
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

    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.formLabel}>Nome</Text>
            <TextInput style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome Sobrenome"
              placeholderTextColor="white"
              keyboardType="default"
          />
          <Text style={styles.formLabel}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={validateEmail}
            placeholder="Email*"
            placeholderTextColor="white"
            keyboardType="default"
          />

          <Text>Fodas</Text>
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
            onChangeText={setPassword}
            placeholder="Digite uma senha"
            placeholderTextColor="white"
            keyboardType="default"
          />
          </View>
          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
          <LoginButton onPress={handleLogin}/>
        </View>
    );
}

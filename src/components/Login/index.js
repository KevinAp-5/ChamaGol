import React, { useState } from "react";
import {Text,
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableOpacity
} from "react-native";
import styles from "./style";
import validator from "validator";
import { validatePassword } from "../Utilities/validations";


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

      if (validator.isEmail(input)) {
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
        setError('A senha contém 8 caracteres')
      }
      else {
        setError('')
      }
    };

    return (
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
          />

          <Text style={styles.formLabel}>Senha</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={passwordValidate}
            placeholder="Digite uma senha"
            placeholderTextColor="black"
            keyboardType="default"
            secureTextEntry
          />
          </View>

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

          <View style={styles.forgotPasswordContext}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </View>

          <View style={styles.registerContext}>
            <Text style={styles.registerText}>Cadastre-se</Text>
          </View>

        </Pressable>
    );
}

export default Login;
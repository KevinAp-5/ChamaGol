import React from "react";

import { View, Text, TouchableOpacity, Keyboard, Pressable } from "react-native";
import styles from "./style";
import Title from "../Title";

const HomeScreen = ({navigation}) => {
  const navigateLogin = () => {
    navigation.navigate('Login');
  };

  const navigateRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Title title="CHAMAGOL"/>
      <Pressable
        onPress={Keyboard.dismiss}
        style={styles.formContext}
      >
        <Text style={styles.title}>Bem-vindo!</Text>
        <TouchableOpacity
          onPress={navigateLogin}
          style={styles.button}
        >
          <Text style={styles.buttonLoginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={navigateRegister}
          style={styles.button}
        >
          <Text style={styles.buttonRegisterText}>CADASTRE-SE</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Receba os melhores sinais!</Text>
      </Pressable>
    </View>
  );
}

export default HomeScreen
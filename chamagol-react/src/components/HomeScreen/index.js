import React from "react";

import { View, Text, TouchableOpacity, Keyboard, Pressable, SafeAreaView, StatusBar } from "react-native";
import styles from "./style";
import Title from "../Title";
import "@expo/metro-runtime"
const HomeScreen = ({navigation}) => {
  const navigateLogin = () => {
    navigation.navigate('Login');
  };

  const navigateRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL"/>
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>

        <View style={styles.welcomeContext}>
          <Text style={styles.welcomeText}>Bem-vindo!</Text>
        </View>

        <TouchableOpacity onPress={navigateLogin} style={styles.button}>
          <Text style={styles.buttonLoginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateRegister} style={styles.button}>
          <Text style={styles.buttonRegisterText}>CADASTRE-SE</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Receba os melhores sinais!</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default HomeScreen
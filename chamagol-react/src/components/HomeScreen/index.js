import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Image, Keyboard, Pressable } from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import styles from "./style";
import Title from "../Title";

const HomeScreen = ({ navigation }) => {
  const navigateLogin = () => {
    navigation.navigate("Login");
  };

  const navigateRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL" />
      <Pressable onPress={Keyboard.dismiss} style={styles.formContext}>
        <View style={styles.header}>
          <Image source={require("./icon.png")} style={styles.welcomeImage} />
          <Text style={styles.welcomeText}>Bem-vindo!</Text>
          <Text style={styles.subtitleText}>
            Entre ou cadastre-se para aproveitar nossos melhores serviços e sinais.
          </Text>
        </View>

        <TouchableOpacity onPress={navigateLogin}>
          <LinearGradient
            colors={["#0C3B2E", "#6D9773"]}
            style={styles.button}
          >
            <Text style={styles.buttonLoginText}>LOGIN</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateRegister}>
          <LinearGradient
            colors={["#FFBA00", "#FFD54F"]}
            style={styles.button}
          >
            <Text style={styles.buttonRegisterText}>CADASTRE-SE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Receba os melhores sinais!</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

export default HomeScreen;

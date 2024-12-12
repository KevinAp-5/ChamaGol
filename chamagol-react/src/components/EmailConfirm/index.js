import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from "react-native";
import styles from "./style";
import Title from "../Title";
import "@expo/metro-runtime"
let icona = require("./check-icon.png")

const EmailConfirmation = ({ navigation, route }) => {

  const handleContinue = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL"/>
      <View style={styles.formContext}>
        <View style={styles.confirmationContainer}>
          <Text style={styles.titleText}>E-mail Confirmado!</Text>
          
          <View style={styles.iconContainer}>
            <Image 
              source={icona}
              style={styles.confirmationIcon}
            />
          </View>

          <Text style={styles.confirmationText}>
            Seu e-mail foi confirmado com sucesso. Você já pode fazer login na plataforma.
          </Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>FAZER LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmailConfirmation;
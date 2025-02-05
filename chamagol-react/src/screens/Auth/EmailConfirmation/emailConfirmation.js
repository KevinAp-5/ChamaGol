import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from "react-native";
import styles from "./style";
import "@expo/metro-runtime";
let icona = require("../../../../assets/images/check-icon.png");
import Title from "../../../components/Title";
const EmailConfirmation = ({ navigation, route }) => {
  const { email } = route.params || {};

  const handleResetPassword = () => {
    navigation.navigate("ResetPassword", { email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title title="CHAMAGOL"/>
      <View style={styles.formContext}>
        <View style={styles.confirmationContainer}>
          <Text style={styles.titleText}>Email confirmado!</Text>
          <View style={styles.iconContainer}>
            <Image 
              source={icona}
              style={styles.confirmationIcon}
            />
          </View>
          <Text style={styles.confirmationText}>
            Seu e-mail foi confirmado com sucesso. Você já pode redefinir sua senha.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleResetPassword}
          >
            <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmailConfirmation;
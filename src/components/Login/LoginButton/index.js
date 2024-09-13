import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./style";


export default function LoginButton(props) {
  const handleLogin_Onpress = props.onPress;

  return (
    <View style={styles.buttonContext}>
      <TouchableOpacity style={styles.button} onPress={handleLogin_Onpress}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
};
import React from "react";
import { View, Text, SafeAreaView} from "react-native";
import styles from "./style"

export default function Title(props) {
  let titleText = props.title;
  return (
    <SafeAreaView style={styles.titleContext}>
      <Text style={styles.title}>{titleText}</Text>
    </SafeAreaView>
  )
}
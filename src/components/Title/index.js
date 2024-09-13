import React from "react";
import { View, Text} from "react-native";
import styles from "./style"

export default function Title() {
    return (
        <View style={styles.titleContext}>
            <Text style={styles.title}>LOGIN</Text>
        </View>
    )
}
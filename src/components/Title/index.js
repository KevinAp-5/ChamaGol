import React from "react";
import { View, Text} from "react-native";
import styles from "./style"

export default function Title(props) {
    let titleText = props.title;
    return (
        <View style={styles.titleContext}>
            <Text style={styles.title}>{titleText}</Text>
        </View>
    )
}
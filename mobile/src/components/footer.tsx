import { View, Text } from "react-native";
import { useTheme } from "../theme/theme";

export default function Footer() {
    const {colors} = useTheme();
    return (
        <View style={{ alignItems: "center", padding: 16}}>
        <Text style={{ fontSize: 13, textAlign: "center",  color: colors.muted,}}>
            © 2025 CHAMAGOL. All Rights Reserved.
        </Text>
        </View>
    );
}
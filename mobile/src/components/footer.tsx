import { View, Text } from "react-native";
import { useTheme } from "../theme/theme";

export default function Footer() {
    const {colors} = useTheme();
    return (
        <View style={{alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    }}>
        <Text style={{ fontSize: 12, textAlign: "center",  color: colors.muted,}}>
            © 2025 CHAMAGOL. All Rights Reserved.
        </Text>
        </View>
    );
}
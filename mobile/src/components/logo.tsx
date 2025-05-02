import { View, Image, ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

interface LogoProps {
    source?: ImageSourcePropType;
    containerStyle?: StyleProp<ViewStyle>;
}

export default function Logo({ source, containerStyle }: LogoProps) {
    const defaultSource = require('../assets/logo.png');
    return (
        <View style={containerStyle}>
            <Image
                source={source || defaultSource}
                style={{
                    width: 250,
                    height: 250,
                    resizeMode: 'contain',
                    marginBottom: 0,
                }}
            />
        </View>
    );
}
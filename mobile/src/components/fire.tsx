import React from 'react';
import { View } from 'react-native';
import { Image } from "expo-image";

const FIRE_GIF = require("../assets/fire.gif");

export default function FireGif() {
  return (
    <View>
        <Image
        source={FIRE_GIF}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
    </View>
    
  );
}

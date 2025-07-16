import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { useTheme } from "../theme/theme";

type Props = NativeStackScreenProps<RootStackParamList, "EmailConfirmationSuccessScreen">;

export default function EmailConfirmationSuccessScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const checkmarkScale = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
    
    // Run checkmark animation with a slight delay
    setTimeout(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      }).start();
    }, 400);
  }, []);
  
  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true
    }).start();
  };
  
  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, '#B71C1C']}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <Animated.View 
            style={[
              styles.logoContainer, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Logo source={require("../assets/logo_white_label.png")} />
            <Text style={[styles.appTitle, { color: colors.background, fontFamily: fonts.bold }]}>
              CHAMAGOL
            </Text>
            <Text style={[styles.subtitle, { color: colors.white, fontFamily: fonts.regular }]}>
              Verificação de E-mail
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.contentWrapper, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.contentContainer}>
              <Animated.View 
                style={[
                  styles.successIconContainer, 
                  { transform: [{ scale: checkmarkScale }] }
                ]}
              >
                <View style={[styles.checkmarkCircle, { backgroundColor: colors.success }]}>
                  <MaterialCommunityIcons 
                    name="check" 
                    size={40} 
                    color="#FFFFFF" 
                  />
                </View>
              </Animated.View>
              
              <Text style={[styles.title, { color: colors.secondary, fontFamily: fonts.bold }]}>
                E-mail Confirmado!
              </Text>
              
              <Text style={[styles.message, { color: colors.muted, fontFamily: fonts.regular }]}>
                Seu e-mail foi verificado com sucesso.
                Você já pode acessar sua conta e aproveitar
                o ChamaGol.
              </Text>
              
              <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%', marginTop: 32 }}>
                <TouchableOpacity
                  style={[
                    styles.loginButton, 
                    { backgroundColor: colors.secondary }
                  ]}
                  onPress={handleGoToLogin}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bold }]}>
                    IR PARA LOGIN
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
          
          <Footer />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  contentWrapper: {
    width: width - 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    alignItems: "center",
    borderRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
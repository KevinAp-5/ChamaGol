import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";

type Props = NativeStackScreenProps<RootStackParamList, "PasswordResetEmailConfirmed">;

export default function PasswordResetEmailConfirmed({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const checkmarkScale = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    // Entrada principal com animação
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
    
    // Animação de entrada do checkmark com efeito bounce
    setTimeout(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      }).start();
      
      // Adicionar animação de pulso para o ícone de sucesso
      startPulseAnimation();
    }, 400);
  }, []);
  
  // Animação de pulso suave para o ícone de sucesso
  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 700,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true
      })
    ]).start(() => startPulseAnimation());
  };
  
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

  const handleGoToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#B71C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoContainer}>
              <Logo source={require("../assets/logo_white_label.png")} />
              <Text style={[styles.appTitle, { color: "#E53935", fontFamily: fonts.extraBold }]}>
                CHAMAGOL
              </Text>
              <Text style={[styles.tagline, { color: '#FFFFFF', fontFamily: fonts.regular }]}>
                Seu universo esportivo
              </Text>
            </View>
            
            <Animated.View 
              style={[
                styles.contentContainer, 
                { 
                  backgroundColor: '#FFFFFF',
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 8,
                }
              ]}
            >
              <Animated.View style={[
                styles.successIconContainer,
                {
                  transform: [
                    { scale: checkmarkScale },
                    { scale: pulseAnim }
                  ],
                  backgroundColor: '#34C759',
                }
              ]}>
                <MaterialCommunityIcons name="check" size={64} color="#FFFFFF" />
              </Animated.View>
              
              <Text style={[styles.title, { color: '#000000', fontFamily: fonts.bold }]}>
                E-mail Confirmado!
              </Text>
              
              <View style={styles.divider} />
              
              <Text style={[styles.message, { color: '#757575', fontFamily: fonts.regular }]}>
                Seu e-mail foi confirmado com sucesso. Agora você pode prosseguir e redefinir sua senha para recuperar o acesso à sua conta.
              </Text>
              
              <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%', marginTop: 32 }}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#E53935' }]}
                  onPress={handleGoToForgotPassword}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, { color: '#FFFFFF', fontFamily: fonts.bold }]}>
                    REDEFINIR SENHA
                  </Text>
                  <MaterialCommunityIcons name="lock-reset" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("Login")}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color="#E53935" style={styles.backIcon} />
                <Text style={[styles.backButtonText, { color: '#E53935', fontFamily: fonts.medium }]}>
                  Voltar para o login
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
          
          <Footer />
        </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.9,
  },
  contentContainer: {
    width: width - 32,
    borderRadius: 16, // xl border radius do design system
    padding: 32,
    alignItems: "center",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 9999, // round border radius do design system
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    width: '50%',
    height: 3,
    backgroundColor: '#E53935',
    marginBottom: 24,
    borderRadius: 4,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderRadius: 12, // lg border radius do design system
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    marginRight: 8,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 14,
  },
});
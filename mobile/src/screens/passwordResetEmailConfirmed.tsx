import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { CustomAlertProvider } from "../components/CustomAlert";

type Props = NativeStackScreenProps<RootStackParamList, "PasswordResetEmailConfirmed">;

function PasswordResetEmailConfirmedContent({ navigation }: Props) {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, colors.highlight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        {/* Header com Logo */}
        <Animated.View 
          style={[
            styles.headerContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Logo source={require("../assets/logo_white_label.png")} />
          <Text style={[styles.appTitle, { color: colors.secondary, fontFamily: fonts.extraBold }]}>
            CHAMAGOL
          </Text>
          <Text style={[styles.tagline, { color: colors.white, fontFamily: fonts.regular }]}>
            Seu universo esportivo
          </Text>
        </Animated.View>

        {/* Conteúdo Principal */}
        <View style={styles.mainContent}>
          <Animated.View 
            style={[
              styles.contentContainer, 
              { 
                backgroundColor: colors.background,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                ...styles.cardShadow
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
                backgroundColor: colors.success,
                ...styles.iconShadow
              }
            ]}>
              <MaterialCommunityIcons name="check" size={64} color={colors.white} />
            </Animated.View>
            
            <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
              E-mail Confirmado!
            </Text>
            
            <View style={[styles.divider, { backgroundColor: colors.secondary }]} />
            
            <Text style={[styles.message, { color: colors.muted, fontFamily: fonts.regular }]}>
              Seu e-mail foi confirmado com sucesso. Agora você pode prosseguir e redefinir sua senha para recuperar o acesso à sua conta.
            </Text>
            
            <View style={styles.buttonContainer}>
              <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.secondary }]}
                  onPress={handleGoToForgotPassword}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.white, fontFamily: fonts.bold }]}>
                    REDEFINIR SENHA
                  </Text>
                  <MaterialCommunityIcons name="lock-reset" size={20} color={colors.white} />
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color={colors.secondary} />
                <Text style={[styles.backButtonText, { color: colors.secondary, fontFamily: fonts.medium }]}>
                  Voltar para o login
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Footer fixo */}
        <View style={styles.footerContainer}>
          <Footer />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function PasswordResetEmailConfirmed(props: Props) {
  return (
    <CustomAlertProvider>
      <PasswordResetEmailConfirmedContent {...props} />
    </CustomAlertProvider>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 16,
    minHeight: 140,
    justifyContent: "center",
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
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentContainer: {
    width: width - 32,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginTop: 32, // afasta do header
    backgroundColor: "#FFF",
    zIndex: 1,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconShadow: {
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
    width: 60,
    height: 3,
    marginBottom: 24,
    borderRadius: 2,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 24,
  },
  primaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  footerContainer: {
    paddingBottom: 0,
  },
});
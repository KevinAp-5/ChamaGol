import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RESEND_TIMEOUT = 60; // segundos

const EmailVerificationScreen = ({ navigation }: any) => {
  const { colors, fonts } = useTheme();

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Timer para reenvio
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    if (!canResend) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleResend = () => {
    // TODO: Chame sua API para reenviar o e-mail de confirmação
    setTimer(RESEND_TIMEOUT);
    setCanResend(false);
    // Feedback visual opcional
  };

  const handlePressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header com gradiente - fica atrás do conteúdo */}
      <SafeAreaView style={styles.safeAreaHeader}>
        <LinearGradient
          colors={["#000000", "#B71C1C"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
              CHAMAGOL
            </Text>
            <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
              Confirmação de E-mail
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Conteúdo principal com cantos arredondados na parte superior */}
      <View style={styles.mainContent}>
        {/* Card principal */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: "#fff",
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Image
              source={require("../assets/mail.png")}
              style={styles.icon}
            />
          </View>
          <Text
            style={[
              styles.title,
              { color: "#E53935", fontFamily: fonts.bold },
            ]}
          >
            Verifique seu e-mail!
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: "#757575", fontFamily: fonts.regular },
            ]}
          >
            Enviamos um link de confirmação para o seu e-mail.
          </Text>
          <Text
            style={[
              styles.info,
              { color: "#757575", fontFamily: fonts.regular },
            ]}
          >
            Não encontrou? Olhe na sua caixa de spam ou lixo eletrônico.
          </Text>
          <Animated.View style={{ transform: [{ scale: buttonScale }], width: "100%" }}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: canResend ? "#E53935" : "#E0E0E0",
                },
              ]}
              onPress={handleResend}
              disabled={!canResend}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="email-sync"
                size={20}
                color={canResend ? "#fff" : "#BDBDBD"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: canResend ? "#fff" : "#BDBDBD",
                    fontFamily: fonts.bold,
                  },
                ]}
              >
                {canResend
                  ? "Reenviar e-mail"
                  : `Reenviar em ${timer}s`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: "#E53935", fontFamily: fonts.bold },
              ]}
            >
              Trocar e-mail
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: "#757575" }]}>
            © 2025 CHAMAGOL. Todos os direitos reservados.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeAreaHeader: {
    zIndex: 2,
    backgroundColor: "#000",
  },
  headerGradient: {
    paddingBottom: 60, // Aumenta o padding inferior para permitir sobreposição
  },
  headerContent: {
    paddingTop: 20,
    paddingBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -40, // Move para cima para sobrepor o header
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 2, // Garante que fique acima do header
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  card: {
    borderRadius: 14,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  info: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    flexDirection: "row",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default EmailVerificationScreen;

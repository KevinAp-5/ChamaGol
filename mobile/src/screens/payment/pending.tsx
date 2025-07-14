import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../config/Api";
import { useTheme } from "../../theme/theme";
import { CustomAlertProvider, showCustomAlert } from "../../components/CustomAlert";
import Logo from "../../components/logo"; // Importando o componente Logo
import Footer from "../../components/footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PaymentPendingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { colors, fonts } = useTheme();
  
  const [countdown, setCountdown] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  // Inicia animações ao montar o componente
  useEffect(() => {
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
    
    // Configura animação de pulso para o ícone de pendente
    startPulseAnimation();
  }, []);
  
  // Animação de pulso para o ícone
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  // Inicia o countdown de verificação automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          checkSubscriptionStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const setSubscriptionPro = async () => {
    await AsyncStorage.setItem("subscription", "PRO");
  }
  // Função para verificar o status da assinatura no backend
  const checkSubscriptionStatus = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    setIsLoading(true);
    
    try {
      const response = await api.get("/payment/status");
      
      if (response.status === 200) {
        const subscriptionStatus = response.data?.message;
        
        // Aguarda um pouco antes de redirecionar para melhorar UX
        setTimeout(() => {
          setIsLoading(false);
          
          if (subscriptionStatus === "VIP") {
            // Pagamento aprovado, redireciona para tela de sucesso
            setSubscriptionPro();
            navigation.navigate("PaymentSuccess");
          } else {
            // Pagamento ainda pendente
            showCustomAlert("Seu pagamento ainda está em processamento. Por favor, aguarde ou tente novamente mais tarde.", "Pagamento Pendente");
            setCountdown(15); // Reinicia o contador
            setIsChecking(false);
          }
        }, 1500);
      } else {
        throw new Error("Falha ao verificar status");
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setIsLoading(false);
      showCustomAlert("Não foi possível verificar o status do seu pagamento. Tente novamente.", "Erro de Conexão");
      setIsChecking(false);
      setCountdown(15); // Reinicia o contador
    }
  };

  return (
    <CustomAlertProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, '#222222']}
          style={styles.gradientBackground}
        >
          <Animated.View 
            style={[
              styles.container, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo do ChamaGol no topo */}
            <View style={styles.logoContainer}>
              <Logo source={require("../../assets/logo_white_label.png")} />
              <Text style={[styles.appTitle, { color: colors.secondary, fontFamily: fonts.bold }]}>
                CHAMAGOL
              </Text>
            </View>
            
            <View style={[
              styles.contentContainer, 
              { backgroundColor: colors.background }
            ]}>
              <Animated.View style={[
                styles.statusIcon, 
                { 
                  backgroundColor: colors.accent,
                  transform: [{ scale: pulseAnim }]
                }
              ]}>
                <MaterialCommunityIcons name="timer-sand" size={40} color="#FFFFFF" />
              </Animated.View>
              
              <Text style={[
                styles.title, 
                { color: colors.primary, fontFamily: fonts.bold }
              ]}>
                Pagamento em processamento
              </Text>
              
              <Text style={[
                styles.description, 
                { color: colors.muted, fontFamily: fonts.regular }
              ]}>
                Estamos aguardando a confirmação do seu pagamento. Isso pode levar
                alguns minutos para ser processado pelo gateway de pagamento.
              </Text>

              <View style={styles.statusContainer}>
                <Text style={[
                  styles.statusText, 
                  { color: colors.muted, fontFamily: fonts.regular }
                ]}>
                  {countdown > 0 
                    ? `Verificando automaticamente em ${countdown} segundos` 
                    : "Verificando status..."}
                </Text>
                <ActivityIndicator
                  size="small"
                  color={colors.secondary}
                  style={styles.smallLoader}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button, 
                  { 
                    backgroundColor: colors.secondary,
                    opacity: isLoading ? 0.7 : 1
                  }
                ]}
                onPress={checkSubscriptionStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={[
                      styles.buttonText, 
                      { color: '#FFFFFF', fontFamily: fonts.bold }
                    ]}>
                      Verificar status agora
                    </Text>
                    <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Home")}
                disabled={isLoading}
              >
                <Text style={[
                  styles.secondaryButtonText, 
                  { 
                    color: colors.secondary, 
                    fontFamily: fonts.semibold,
                    opacity: isLoading ? 0.7 : 1
                  }
                ]}>
                  Voltar para o início
                </Text>
              </TouchableOpacity>
              
              <View style={styles.infoContainer}>
                <MaterialCommunityIcons name="information-outline" size={16} color={colors.muted} />
                <Text style={[
                  styles.infoText, 
                  { color: colors.muted, fontFamily: fonts.regular }
                ]}>
                  Você receberá uma notificação quando seu pagamento for confirmado.
                </Text>
              </View>
            </View>
          </Animated.View>
        <Footer></Footer>
        </LinearGradient>
      </SafeAreaView>
    </CustomAlertProvider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
    letterSpacing: 1,
  },
  contentContainer: {
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    marginRight: 8,
  },
  smallLoader: {
    marginLeft: 4,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: 12,
    maxWidth: "100%",
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  }
});

export default PaymentPendingScreen;
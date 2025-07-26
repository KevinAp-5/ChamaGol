import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Alert
} from "react-native";
import CheckBox from "expo-checkbox";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { api } from "../config/Api";
import { useTheme } from "../theme/theme";
import { fetchTerm } from "../components/termOfUse";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isTermAccepted, setIsTermAccepted] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
 
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
 
  useEffect(() => {
      showCustomAlert(
        "Você confirma que tem mais de 18 anos?", {
          title: "Confirmação de idade",
          confirmText: "Sim",
          cancelText: "Não",
          showCancel: true,
          onConfirm: () => {},
          onCancel: () => {navigation.navigate("Login")}
        }
      )
  }, []); 
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

  const handleViewTerm = async () => {
    const term = await fetchTerm();
    Alert.alert("Termos de uso", term || "Não foi possível carregar o termo.");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (!isTermAccepted) {
      showCustomAlert("Aceite os termos de uso para prosseguir.", "Termos de Uso");
      return;
    }
    
    if (!name || !email || !password) {
      showCustomAlert("Por favor, preencha todos os campos.", "Campos Obrigatórios");
      return;
    }
    
    if (!validateEmail(email)) {
      showCustomAlert("Por favor, insira um e-mail válido.", "E-mail Inválido");
      return;
    }
    
    if (password.length < 6) {
      showCustomAlert("A senha deve ter pelo menos 6 caracteres.", "Senha Inválida");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(
        "auth/register",
        { name, login: email, password }
      );

      if (response.status === 201) {
        await AsyncStorage.setItem("registerEmail", email);
        navigation.navigate("EmailVerification");
      } else {
        showCustomAlert((response.data as { message: string })?.message || "Erro ao registrar.", "Erro");
      }
    } catch (error: any) {
      showCustomAlert(error?.response?.data?.message || "Ocorreu um erro ao registrar. Tente novamente.", "Erro");
    } finally {
      setLoading(false);
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
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                <Text style={[styles.appTitle, { color: colors.secondary, fontFamily: fonts.bold }]}>
                  CHAMAGOL
                </Text>
                <Text style={[styles.tagline, { color: '#FFFFFF' }]}>
                  Seu universo esportivo
                </Text>
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.formContainer, 
                  { 
                    backgroundColor: colors.background,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
                  Crie sua conta
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.regular }]}>
                  Preencha os dados abaixo para começar
                </Text>
                
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    isNameFocused && styles.inputContainerFocused,
                    { borderColor: isNameFocused ? colors.secondary : colors.muted }
                  ]}>
                    <MaterialCommunityIcons 
                      name="account-outline" 
                      size={20} 
                      color={isNameFocused ? colors.secondary : colors.muted} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Nome completo"
                      placeholderTextColor={colors.muted}
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      style={[
                        styles.input,
                        { color: colors.primary, fontFamily: fonts.regular }
                      ]}
                    />
                  </View>
                  
                  <View style={[
                    styles.inputContainer,
                    isEmailFocused && styles.inputContainerFocused,
                    { borderColor: isEmailFocused ? colors.secondary : colors.muted }
                  ]}>
                    <MaterialCommunityIcons 
                      name="email-outline" 
                      size={20} 
                      color={isEmailFocused ? colors.secondary : colors.muted} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="E-mail"
                      placeholderTextColor={colors.muted}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      style={[
                        styles.input,
                        { color: colors.primary, fontFamily: fonts.regular }
                      ]}
                    />
                  </View>
                  
                  <View style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                    { borderColor: isPasswordFocused ? colors.secondary : colors.muted }
                  ]}>
                    <MaterialCommunityIcons 
                      name="lock-outline" 
                      size={20} 
                      color={isPasswordFocused ? colors.secondary : colors.muted} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Senha"
                      placeholderTextColor={colors.muted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      style={[
                        styles.input,
                        { color: colors.primary, fontFamily: fonts.regular }
                      ]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.termsContainer}>
                  <CheckBox 
                    value={isTermAccepted} 
                    onValueChange={setIsTermAccepted}
                    color={isTermAccepted ? colors.secondary : undefined}
                    style={styles.checkbox}
                  />
                  <Text style={[styles.termsText, { color: colors.muted, fontFamily: fonts.regular }]}>
                    Eu aceito os {" "}
                    <Text 
                      style={[styles.termsLink, { color: colors.secondary, fontFamily: fonts.semiBold }]}
                      onPress={handleViewTerm}>
                      Termos de Uso e declaro ser maior de idade
                    </Text>
                  </Text>
                </View>
                
                <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                  <TouchableOpacity
                    style={[
                      styles.registerButton, 
                      { 
                        backgroundColor: !isTermAccepted ? colors.muted : colors.secondary,
                        opacity: !isTermAccepted ? 0.7 : 1 
                      }
                    ]}
                    onPress={handleRegister}
                    disabled={loading || !isTermAccepted}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <View style={styles.loadingIndicator}>
                        <MaterialCommunityIcons name="loading" size={24} color="#FFF" />
                      </View>
                    ) : (
                      <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bold }]}>
                        CRIAR CONTA
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
                
                <View style={styles.loginOption}>
                  <Text style={[styles.loginText, { color: colors.muted, fontFamily: fonts.regular }]}>
                    Já tem uma conta?
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text style={[styles.loginLink, { color: colors.secondary, fontFamily: fonts.semiBold }]}>
                      Entrar
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
            
            <Footer />
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </CustomAlertProvider>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
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
  tagline: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
  },
  formContainer: {
    width: width - 32,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  inputContainerFocused: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: "500",
  },
  registerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingIndicator: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loginOption: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "500",
  },
});
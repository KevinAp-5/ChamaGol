import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
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
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { api } from "../config/Api";
import { useTheme } from "../theme/theme";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [login, setLogin] = useState(false);
 
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
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

  const handleLogin = async () => {
    if (!email || !password) {
      showCustomAlert("Por favor, preencha seu e-mail e senha.", "Campos obrigatórios");
      return;
    }
    
    if (!validateEmail(email)) {
      showCustomAlert("Por favor, insira um e-mail válido.", "E-mail inválido");
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post(
        "auth/login",
        { login: email, password }
      );
      
      if (response.status === 200 && (response.data?.token || response.data?.accessToken)) {
        const accessToken = response.data.token || response.data.accessToken;
        const refreshToken = response.data.refreshToken;
        setLogin(true);

        await SecureStore.setItemAsync('accessToken', accessToken);
        if (refreshToken) {
          await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
        
        // Get user info after successful login
        await getUserInfo();
        
        // Use a brief timeout to show loading state before navigation
        setTimeout(() => {
          navigation.navigate("Home");
        }, 500);
      } else {
        showCustomAlert("E-mail ou senha inválidos.", "Falha no login");
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Ocorreu um erro ao fazer login. Tente novamente.";
      showCustomAlert(errorMessage, "Erro");
    } finally {
      setLoading(false);
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const getUserInfo = async() => {
    try {
      const response = await api.get("/auth/user/info");
      if (response.status == 200 && response.data) {
          await AsyncStorage.setItem("username", response.data.username);
          await AsyncStorage.setItem("lastLogin", response.data.lastLogin);
          console.log("informações salvas.")
      }
    } catch (error: any) {
      console.log("erro ao recuperar user login info" + error?.response?.data?.message);
    }
  }

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
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
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
                  Bem-vindo de volta!
                </Text>
                
                <View style={styles.inputGroup}>
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
                
                <TouchableOpacity
                  onPress={() => navigation.navigate("RequestPassword")}
                  style={styles.forgotPasswordButton}
                >
                  <Text
                    style={[styles.forgotPasswordText, { color: colors.secondary, fontFamily: fonts.regular }]}
                  >
                    Esqueceu sua senha?
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.actionButtons}>
                  <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                    <TouchableOpacity
                      style={[styles.loginButton, { backgroundColor: colors.secondary }]}
                      onPress={handleLogin}
                      disabled={loading}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <View style={styles.loadingIndicator}>
                          <MaterialCommunityIcons name="loading" size={24} color="#FFF" />
                        </View>
                      ) : (
                        <>
                          <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bold }]}>
                            ENTRAR
                          </Text>
                          <MaterialCommunityIcons name="login" size={20} color="#FFF" />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                  
                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.muted }]} />
                    <Text style={[styles.dividerText, { color: colors.muted, fontFamily: fonts.regular }]}>
                      ou
                    </Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.muted }]} />
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.registerButton, { borderColor: colors.accent }]}
                    onPress={() => navigation.navigate("Register")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.registerButtonText, { color: colors.accent, fontFamily: fonts.bold }]}
                    >
                      CRIAR CONTA
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
            
          </KeyboardAvoidingView>
            <Footer />
        </LinearGradient>
      </SafeAreaView>
    </CustomAlertProvider>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    minHeight: height - 100, // Ensure minimum height for proper layout
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
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  loadingIndicator: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    width: "100%",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
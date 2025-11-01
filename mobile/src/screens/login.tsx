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
  ScrollView,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../App";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { api } from "../config/Api";
import { useTheme } from "../theme/theme";
import { CustomAlertProvider, useCustomAlert } from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

function LoginContent({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const logoScale = useState(new Animated.Value(0.8))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const loadingRotation = useState(new Animated.Value(0))[0];
  const formSlideAnim = useState(new Animated.Value(100))[0];
  const inputFocusAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Resetar flags ao abrir a tela de login
    const resetFlags = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem("subscriptionFlag", "0"),
          AsyncStorage.setItem("termFlag", "0"),
          AsyncStorage.setItem("subscriptionAlertFlag", "0")
        ]);
        console.log("Flags resetadas no login");
      } catch (error) {
        console.log("Erro ao resetar flags:", error);
      }
    };
    resetFlags();
    
    // Animações de entrada sequenciais para melhor UX
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        })
      ]),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Animação do loading
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ).start();
    } else {
      loadingRotation.setValue(0);
    }
  }, [loading]);

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

  const handleInputFocus = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  // Exemplo de uso:
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Por favor, preencha seu e-mail e senha.", {
        title: "Campos obrigatórios",
        confirmText: "OK"
      });
      return;
    }
    
    if (!validateEmail(email)) {
      showAlert("Por favor, insira um e-mail válido.", {
        title: "E-mail inválido",
        confirmText: "OK"
      });
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
        await SecureStore.setItemAsync('accessToken', accessToken);
        if (refreshToken) {
          await SecureStore.setItemAsync('refreshToken', refreshToken);
        }
        
        await Promise.all([
          AsyncStorage.setItem("subscriptionFlag", "0"),
          AsyncStorage.setItem("termFlag", "0")
        ]);
        
        setTimeout(() => {
          navigation.navigate("Home");
        }, 500);
      } else {
        showAlert("E-mail ou senha inválidos.", {
          title: "Erro",
          confirmText: "OK"
        });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Ocorreu um erro ao fazer login. Tente novamente.";
      showAlert(errorMessage, {
        title: "Atenção",
        confirmText: "OK"
      });
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

  const rotateInterpolate = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#B71C1C']}
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
            {/* Logo Section com animação melhorada */}
            <Animated.View 
              style={[
                styles.logoContainer, 
                { 
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: logoScale }
                  ]
                }
              ]}
            >
              <View style={styles.logoWrapper}>
                <Logo source={require("../assets/logo_white_label.png")} />
              </View>
              <Text style={styles.appTitle}>
                CHAMAGOL
              </Text>
              <Text style={styles.tagline}>
                Seu universo esportivo
              </Text>
            </Animated.View>
            
            {/* Form Section com design melhorado */}
            <Animated.View 
              style={[
                styles.formContainer, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: formSlideAnim }]
                }
              ]}
            >
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>
                  Bem-vindo de volta!
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Faça login para continuar
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                {/* Input Email melhorado */}
                <View style={[
                  styles.inputContainer,
                  isEmailFocused && styles.inputContainerFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="email-outline" 
                      size={20} 
                      color={isEmailFocused ? "#E53935" : "#757575"} 
                    />
                  </View>
                  <TextInput
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#757575"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => {
                      setIsEmailFocused(true);
                      handleInputFocus();
                    }}
                    onBlur={() => {
                      setIsEmailFocused(false);
                      handleInputBlur();
                    }}
                    style={styles.input}
                  />
                </View>
                
                {/* Input Password melhorado */}
                <View style={[
                  styles.inputContainer,
                  isPasswordFocused && styles.inputContainerFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons 
                      name="lock-outline" 
                      size={20} 
                      color={isPasswordFocused ? "#E53935" : "#757575"} 
                    />
                  </View>
                  <TextInput
                    placeholder="Digite sua senha"
                    placeholderTextColor="#757575"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => {
                      setIsPasswordFocused(true);
                      handleInputFocus();
                    }}
                    onBlur={() => {
                      setIsPasswordFocused(false);
                      handleInputBlur();
                    }}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#757575"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => navigation.navigate("RequestPassword")}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                  <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View
                          style={[
                            styles.loadingIndicator,
                            { transform: [{ rotate: rotateInterpolate }] }
                          ]}
                        >
                          <MaterialCommunityIcons 
                            name="loading" 
                            size={20} 
                            color="#FFFFFF" 
                          />
                        </Animated.View>
                        <Text style={styles.loadingText}>
                          Entrando...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>
                          ENTRAR
                        </Text>
                        <MaterialCommunityIcons 
                          name="arrow-right" 
                          size={20} 
                          color="#FFFFFF" 
                          style={styles.buttonIcon}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
                
                {/* Divider melhorado */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.dividerTextContainer}>
                    <Text style={styles.dividerText}>
                      ou
                    </Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>
                
                {/* Register Button melhorado */}
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => navigation.navigate("Register")}
                  activeOpacity={0.8}
                >
                  <View style={styles.registerButtonContent}>
                    <MaterialCommunityIcons 
                      name="account-plus" 
                      size={20} 
                      color="#E53935" 
                      style={styles.registerButtonIcon}
                    />
                    <Text style={styles.registerButtonText}>
                      CRIAR CONTA
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </LinearGradient>
    </SafeAreaView>
  );
}

export default function LoginScreen(props: Props) {
  return (
    <CustomAlertProvider>
      <LoginContent {...props} />
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: height - 100,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#E53935",
    marginTop: 16,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    opacity: 0.9,
    fontWeight: "400",
  },
  formContainer: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    fontWeight: "400",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    marginBottom: 16,
    overflow: "hidden",
  },
  inputContainerFocused: {
    borderColor: "#E53935",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconContainer: {
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: "#000000",
    fontWeight: "400",
  },
  passwordToggle: {
    padding: 16,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "600",
  },
  actionButtons: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerTextContainer: {
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  dividerText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  registerButton: {
    borderWidth: 1.5,
    borderColor: "#E53935",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  registerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53935",
    letterSpacing: 0.5,
  },
});
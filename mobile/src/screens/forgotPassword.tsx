import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../config/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Footer from "../components/footer";
import Logo from "../components/logo";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors, fonts, spacing, shadows } = useTheme();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    AsyncStorage.getItem("email").then((savedEmail) => {
      if (savedEmail) setEmail(savedEmail);
    });

    // Run entrance animations
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

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (password.length < minLength) {
      return "A senha deve ter pelo menos 8 caracteres.";
    }
    if (!hasNumber || !hasLetter) {
      return "A senha deve conter pelo menos uma letra e um número.";
    }
    return null;
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      showCustomAlert("Por favor, preencha todos os campos.", "Campos obrigatórios");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      showCustomAlert(passwordValidation, "Senha inválida");
      return;
    }

    if (newPassword !== confirmPassword) {
      showCustomAlert("As senhas não coincidem.", "Erro de confirmação");
      return;
    }

    if (!email) {
      showCustomAlert("E-mail não encontrado. Tente novamente o fluxo de recuperação.", "Erro");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("auth/password/reset", { 
        email, 
        password: newPassword 
      });
      
      if (response.status === 200) {
        showCustomAlert('Sua senha foi redefinida com sucesso.', 'Sucesso', 
            () => navigation.navigate('Login')
        );
      } else {
        showCustomAlert(response.data?.message || "Erro ao redefinir a senha.", "Erro");
      }
    } catch (error: any) {
      showCustomAlert(
        error?.response?.data?.message || "Ocorreu um erro inesperado.", 
        "Erro"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomAlertProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={[colors.primary, colors.highlight]}
          style={styles.gradientBackground}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
              <Text style={[styles.tagline, { color: '#FFFFFF', fontFamily: fonts.regular }]}>
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
                },
                shadows.large
              ]}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="lock-reset" 
                  size={64} 
                  color={colors.secondary} 
                />
              </View>

              <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold }]}>
                Redefinir Senha
              </Text>
              
              <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fonts.regular }]}>
                Insira sua nova senha e confirme para redefinir.
              </Text>

              <View style={styles.inputGroup}>
                <View style={[
                  styles.inputContainer,
                  isNewPasswordFocused && styles.inputContainerFocused,
                  { borderColor: isNewPasswordFocused ? colors.secondary : colors.divider }
                ]}>
                  <MaterialCommunityIcons 
                    name="lock-outline" 
                    size={20} 
                    color={isNewPasswordFocused ? colors.secondary : colors.muted} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Nova senha"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    onFocus={() => setIsNewPasswordFocused(true)}
                    onBlur={() => setIsNewPasswordFocused(false)}
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

                <View style={[
                  styles.inputContainer,
                  isConfirmPasswordFocused && styles.inputContainerFocused,
                  { borderColor: isConfirmPasswordFocused ? colors.secondary : colors.divider }
                ]}>
                  <MaterialCommunityIcons 
                    name="lock-check-outline" 
                    size={20} 
                    color={isConfirmPasswordFocused ? colors.secondary : colors.muted} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Confirmar nova senha"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    style={[
                      styles.input,
                      { color: colors.primary, fontFamily: fonts.regular }
                    ]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={22}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.passwordHint}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={16} 
                  color={colors.muted} 
                />
                <Text style={[styles.hintText, { color: colors.muted, fontFamily: fonts.regular }]}>
                  A senha deve ter pelo menos 8 caracteres, incluindo letras e números.
                </Text>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.secondary }]}
                  onPress={handlePasswordReset}
                  disabled={loading}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.loadingIndicator}>
                      <MaterialCommunityIcons name="loading" size={24} color="#FFF" />
                      <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bold, marginLeft: 8 }]}>
                        Redefinindo...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text style={[styles.buttonText, { color: '#FFF', fontFamily: fonts.bold }]}>
                        CONFIRMAR NOVA SENHA
                      </Text>
                      <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                style={styles.backToLoginButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="arrow-left" 
                  size={18} 
                  color={colors.secondary} 
                />
                <Text style={[styles.backToLoginText, { color: colors.secondary, fontFamily: fonts.medium }]}>
                  Voltar ao login
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Footer />
          </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
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
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
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
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  confirmButton: {
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
    marginRight: 8,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    fontSize: 16,
    marginLeft: 6,
  },
});
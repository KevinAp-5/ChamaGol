import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/theme";
import { api } from "../config/Api";
import { CustomAlertProvider, useCustomAlert } from "../components/CustomAlert";

function ProfileContent({ navigation }: any) {
  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState("");
  const [subscription, setSubscription] = useState<String | null>(null);
  const [expirationDate, setExpirationDate] = useState<String | null>(null);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const cardScale = useState(new Animated.Value(0.95))[0];
  
  // Animações individuais para cada botão
  const changePasswordButtonScale = useState(new Animated.Value(1))[0];
  const logoutButtonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
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
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        if (response.status === 200 && response.data) {
          setUsername(response.data.name);
          setEmail(response.data.email);
          setSubscription(response.data.userSubscription);

          if (response.data.expirationDate) {
            const dateExpiration = new Date(response.data.expirationDate);
            const formattedExpirationDate = `${dateExpiration.getDate().toString().padStart(2, "0")}/${(
              dateExpiration.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}/${dateExpiration.getFullYear()}`;
            setExpirationDate(formattedExpirationDate);
          } else {
            setExpirationDate(null);
          }

          // Formatação da data de criação
          const date = new Date(response.data.createdAt);
          const formatted = `${date.getDate().toString().padStart(2, "0")}/${(
            date.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
          setCreated(formatted);
        }
      } catch (error) {
        showAlert(
          "Não foi possível carregar o perfil. Verifique sua conexão e tente novamente.",
          { title: "Erro de conexão" }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Funções de animação para o botão de modificar senha
  const handleChangePasswordPressIn = () => {
    Animated.timing(changePasswordButtonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleChangePasswordPressOut = () => {
    Animated.timing(changePasswordButtonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Funções de animação para o botão de logout
  const handleLogoutPressIn = () => {
    Animated.timing(logoutButtonScale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleLogoutPressOut = () => {
    Animated.timing(logoutButtonScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = () => {
    showAlert(
      "Você tem certeza que deseja sair?",
      {
        title: "Sair da conta",
        confirmText: "Sair",
        cancelText: "Cancelar",
        showCancel: true,
        onConfirm: () => {
          navigation.navigate("Login");
        }
      }
    );
  };

  const handleChangePassword = () => {
    navigation.navigate("RequestPassword");
  };

  const getSubscriptionBadge = () => {
    if (subscription === "VIP") {
      return (
        <LinearGradient
          colors={["#E53935", "#B71C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.proBadge}
        >
          <MaterialCommunityIcons
            name="diamond-stone"
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.proBadgeText, { fontFamily: fonts.bold }]}>
            VIP
          </Text>
        </LinearGradient>
      );
    } else {
      return (
        <View style={[styles.freeBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.freeBadgeText, { fontFamily: fonts.medium }]}>
            GRATUITO
          </Text>
        </View>
      );
    }
  };

  const getSubscriptionStatus = () => {
    if (subscription === "VIP") { 
      return (
        <View style={styles.subscriptionStatusContainer}>
          <Text
            style={[
              styles.infoValue,
              { color: colors.primary, fontFamily: fonts.regular },
            ]}
          >
            Assinante VIP
          </Text>
          {expirationDate && (
            <View style={styles.expirationContainer}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color={colors.secondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.expirationText,
                  { color: colors.secondary, fontFamily: fonts.medium },
                ]}
              >
                Expira em: {expirationDate}
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <Text
          style={[
            styles.infoValue,
            { color: colors.primary, fontFamily: fonts.regular },
          ]}
        >
          Conta Gratuita
        </Text>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={["#000000", "#B71C1C"]}
        style={styles.gradientHeader}
      >
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          MEU PERFIL
        </Text>
        <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
          Gerencie suas informações
        </Text>
      </LinearGradient>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScale }],
            },
          ]}
        >
          <View
            style={[
              styles.profileHeader,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#E53935", "#FF5722"]}
                style={styles.avatarGradient}
              >
                <Text
                  style={[styles.avatarText, { fontFamily: fonts.extraBold }]}
                >
                  {username ? username.charAt(0).toUpperCase() : "?"}
                </Text>
              </LinearGradient>
            </View>
            <Text
              style={[
                styles.profileName,
                { color: colors.primary, fontFamily: fonts.bold },
              ]}
            >
              {username || "Carregando..."}
            </Text>
            {getSubscriptionBadge()}
          </View>

          <View
            style={[styles.infoCard, { backgroundColor: colors.background }]}
          >
            <View style={styles.infoSection}>
              <View style={styles.infoHeaderRow}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={22}
                  color={colors.secondary}
                />
                <Text
                  style={[
                    styles.infoTitle,
                    { color: colors.secondary, fontFamily: fonts.semibold },
                  ]}
                >
                  Informações da Conta
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={colors.muted}
                />
                <View style={styles.infoTextContainer}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.muted, fontFamily: fonts.medium },
                    ]}
                  >
                    E-mail
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: colors.primary, fontFamily: fonts.regular },
                    ]}
                  >
                    {email || "Carregando..."}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color={colors.muted}
                />
                <View style={styles.infoTextContainer}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.muted, fontFamily: fonts.medium },
                    ]}
                  >
                    Data de Registro
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: colors.primary, fontFamily: fonts.regular },
                    ]}
                  >
                    {created || "Carregando..."}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name={
                    subscription === "VIP"
                      ? "trophy-outline"
                      : "account-outline"
                  }
                  size={20}
                  color={colors.muted}
                />
                <View style={styles.infoTextContainer}>
                  <Text
                    style={[
                      styles.infoLabel,
                      { color: colors.muted, fontFamily: fonts.medium },
                    ]}
                  >
                    Tipo de Conta
                  </Text>
                  {getSubscriptionStatus()}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            {/* Botão de Modificar Senha */}
            <Animated.View
              style={{ transform: [{ scale: changePasswordButtonScale }], width: "100%" }}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.secondary }]}
                onPress={handleChangePassword}
                onPressIn={handleChangePasswordPressIn}
                onPressOut={handleChangePasswordPressOut}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.buttonText,
                    { color: "#FFFFFF", fontFamily: fonts.bold },
                  ]}
                >
                  MODIFICAR SENHA
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Botão de Logout */}
            <Animated.View
              style={{
                transform: [{ scale: logoutButtonScale }],
                width: "100%",
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: colors.error }]}
                onPress={handleLogout}
                onPressIn={handleLogoutPressIn}
                onPressOut={handleLogoutPressOut}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color={colors.error}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.outlineButtonText,
                    { color: colors.error, fontFamily: fonts.bold },
                  ]}
                >
                  SAIR DA CONTA
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text
          style={[
            styles.footerText,
            { color: colors.muted, fontFamily: fonts.regular },
          ]}
        >
          © 2025 CHAMAGOL • Todos os direitos reservados
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function ProfileScreen(props: any) {
  return (
    <CustomAlertProvider>
      <ProfileContent {...props} />
    </CustomAlertProvider>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  container: {
    flex: 1,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    marginTop: -18,
  },
  contentContainer: {
    padding: 16,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
  },
  profileName: {
    fontSize: 24,
    marginBottom: 8,
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  freeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  freeBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 16,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoSection: {
    padding: 16,
  },
  infoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
  subscriptionStatusContainer: {
    flex: 1,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
  },
  expirationText: {
    fontSize: 14,
  },
  buttonGroup: {
    marginVertical: 16,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  outlineButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  outlineButtonText: {
    fontSize: 16,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
  },
});
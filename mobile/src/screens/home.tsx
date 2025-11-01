import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  RefreshControl,
  Platform,
} from "react-native";
import { useTheme } from "../theme/theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Footer from "../components/footer";
import * as SecureStore from "expo-secure-store";
import { api } from "../config/Api";
import { TermModal } from "../components/term";
import { CustomAlertProvider, useCustomAlert } from "../components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type SubscriptionType = "FREE" | "PRO" | "VIP" | null;

function HomeContent({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();
  const { showAlert } = useCustomAlert();
  const [showTermModal, setShowTermModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionType>(null);
  const [username, setUsername] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [subscriptionAlert, setSubscriptionAlert] = useState(false);
  const [subscriptionAlertLoaded, setSubscriptionAlertLoaded] = useState(false);
  const [termLoaded, setTermLoaded] = useState(false);

  // Recupera subscription do AsyncStorage assim que entra na tela
  useEffect(() => {
    const loadInitialSubscription = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem("subscription");
        if (storedSubscription) {
          setSubscription(storedSubscription as SubscriptionType);
        }
      } catch (error) {
        console.log("Erro ao recuperar subscription do AsyncStorage", error);
      }
    };
    loadInitialSubscription();
  }, []);

  useEffect(() => {
    const setFlagsAndFetch = async () => {
      try {
        const subscriptionAlertFlag = await AsyncStorage.getItem("subscriptionAlertFlag");
        const subscriptionAlertLoaded = subscriptionAlertFlag === "1";
        const termFlag = await AsyncStorage.getItem("termFlag");
        const termLoaded = termFlag === "1";
        setTermLoaded(termLoaded);

        if (!subscriptionAlertLoaded) {
          await fetchSubscriptionAlert();
        }
        // Atualiza subscription via API
        await fetchSubscription();

        if (!termLoaded) {
          await checkTermAcceptance();
        }
      } catch (error) {
        setTermLoaded(false);
      }
    };
    setFlagsAndFetch();
  }, []);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animation for cards
  const cardAnimations = Array(4)
    .fill(0)
    .map(() => ({
      scale: useRef(new Animated.Value(1)).current,
      opacity: useRef(new Animated.Value(0)).current,
      translateY: useRef(new Animated.Value(20)).current,
    }));

  useEffect(() => {
    const validateToken = async () => {
      try {
        const tokenResponse = await api.get("/auth/token/validate");
        if (!tokenResponse) {
          showAlert(
            "Acesso atualizado, faça login novamente para continuar!",
            { title: "Alerta" }
          );
          navigation.navigate("Login");
        }
      } catch (error) {
        console.log("Erro ao validar token", error);
      }
    };
    validateToken();
  }, []);

  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate cards sequentially
    cardAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(300 + index * 100),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });

    // Get username from storage
    const getUserInfo = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }
        const lastLoginDate = await AsyncStorage.getItem("lastLogin");
        if (lastLoginDate) {
          setLastLogin(lastLoginDate);
        } else {
          const now = new Date().toISOString();
          await AsyncStorage.setItem("lastLogin", now);
          setLastLogin(now);
        }
      } catch (error) {
        console.log("Erro ao recuperar informações do usuário", error);
      }
    };

    getUserInfo();
  }, []);


  const fetchSubscriptionAlert = async () => {
    console.log("fetchSubscriptionAlert chamado");
    try {
      // Verifica se já mostrou o alerta nesta sessão
      const alertFlag = await AsyncStorage.getItem("subscriptionAlertFlag");
      if (alertFlag === "1") {
        console.log("Alerta de assinatura já mostrado nesta sessão");
        // Já mostrou o alerta, não mostra novamente
        return;
      }

      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        console.log("Erro ao recuperar o token.");
        return;
      }

      console.log("Fazendo requisição de subscription alert...");
      const response = await api.get("users/subscription/alert", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("response.status:", response.status);
      console.log("response.data:", response.data);

      if (response.status === 200) {
        setSubscriptionAlert(response.data);


        // Se o alerta estiver ativo, mostra popup e seta flag
        if (response.data) {
          showAlert(
            "Lembre-se de renovar para continuar aproveitando os benefícios VIP.",
            { title: "Sua assinatura vai expirar em breve" }
          );
          await AsyncStorage.setItem("subscriptionAlertFlag", "1");
        }
      } else {
        console.log("Erro ao recuperar alerta de assinatura do usuário", response.data);
      }
    } catch (error) {
      console.log("Erro ao recuperar alerta de assinatura do usuário", error);
    }
  }

  const fetchSubscription = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        console.log("Erro ao recuperar o token.");
        return;
      }

      console.log("Fazendo requisição de subscription...");
      const response = await api.get("users/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.userSubscription) {
        try {
          await AsyncStorage.setItem(
            "subscription",
            response.data.userSubscription
          );
          setSubscription(response.data.userSubscription as SubscriptionType);

          // Remove o controle da subscriptionFlag: não define mais a flag
          // await AsyncStorage.setItem("subscriptionFlag", "1");
          // setSubscriptionLoaded(true);

          console.log("Subscription carregada");
        } catch (error) {
          console.log("Erro ao salvar dados no AsyncStorage");
        }
      }
    } catch (error) {
      console.log("Erro ao recuperar assinatura do usuário", error);
    }
  };

  const checkTermAcceptance = async () => {
    console.log("checkTermAcceptance chamado, termLoaded:", termLoaded);

    if (termLoaded) {
      console.log("Terms já carregados, pulando requisição");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return;

      console.log("Fazendo requisição de terms...");
      const response = await api.get("acceptance/has-accepted-latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data === false) {
        setShowTermModal(true);
      }

      // Definir flag como carregado independente do resultado
      await AsyncStorage.setItem("termFlag", "1");
      setTermLoaded(true);

      console.log("Terms verificados e flag definida");

      if (response.status === 404) {
        showAlert(
          "Erro ao validar usuário, faça login novamente",
          { title: "Erro" }
        );
      }
    } catch (error) {
      showAlert("Erro ao verificar aceite dos termos.", { title: "Erro" });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscription();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula a espera da atualização
    setRefreshing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "hoje";
    } else if (diffDays === 1) {
      return "ontem";
    } else {
      return `há ${diffDays} dias`;
    }
  };

  const handleCardPress = (
    cardAnimation: any,
    navigationTarget: keyof RootStackParamList
  ) => {
    Animated.sequence([
      Animated.timing(cardAnimation.scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimation.scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate(navigationTarget);
    });
  };

  const getSubscriptionBadge = () => {
    if (!subscription || subscription === "FREE") {
      return { text: "GRATUITO", color: colors.muted, icon: "account-outline" };
    } else if (subscription === "PRO") {
      return { text: "PRO", color: "#FFC107", icon: "crown" };
    } else if (subscription === "VIP") {
      return { text: "VIP", color: "#8E24AA", icon: "diamond-stone" };
    }
    return { text: "GRATUITO", color: colors.muted, icon: "account-outline" };
  };

  const badge = getSubscriptionBadge();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, "#222222"]}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.secondary]}
              tintColor="#FFFFFF"
            />
          }
        >
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY }, { scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require("../assets/logo_white_label.png")}
              style={styles.logo}
            />

            <View style={styles.userInfoContainer}>
              <View style={styles.greetingContainer}>
                <Text
                  style={[
                    styles.welcomeText,
                    { color: "#FFFFFF", fontFamily: fonts.regular },
                  ]}
                >
                  Bem-vindo{username ? ", " : ""}
                </Text>
                {username && (
                  <Text
                    style={[
                      styles.usernameText,
                      { color: "#FFFFFF", fontFamily: fonts.bold },
                    ]}
                  >
                    {username}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.subscriptionBadge,
                  { backgroundColor: badge.color },
                ]}
              >
                <MaterialCommunityIcons
                  name={badge.icon}
                  size={14}
                  color="#FFF"
                />
                <Text style={styles.subscriptionText}>{badge.text}</Text>
              </View>
            </View>

            <Text
              style={[
                styles.title,
                { color: "#FFFFFF", fontFamily: fonts.extraBold },
              ]}
            >
              UNIVERSO CHAMAGOL
            </Text>

            {lastLogin && (
              <Text
                style={[
                  styles.lastLoginText,
                  { color: "#FFFFFF88", fontFamily: fonts.regular },
                ]}
              >
                Último acesso: {formatDate(lastLogin)}
              </Text>
            )}
          </Animated.View>

          <View style={styles.cardsContainer}>
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardAnimations[0].opacity,
                  transform: [
                    { translateY: cardAnimations[0].translateY },
                    { scale: cardAnimations[0].scale },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  shadows.medium,
                  { backgroundColor: colors.background },
                ]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[0], "Timeline")}
              >
                <LinearGradient
                  colors={[colors.secondary, colors.highlight]}
                  style={styles.cardIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons name="fire" size={30} color="#FFF" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.primary, fontFamily: fonts.bold },
                    ]}
                  >
                    Sinais
                  </Text>
                  <Text
                    style={[
                      styles.cardDescription,
                      { color: colors.muted, fontFamily: fonts.regular },
                    ]}
                  >
                    Acesse as dicas e análises esportivas
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardAnimations[1].opacity,
                  transform: [
                    { translateY: cardAnimations[1].translateY },
                    { scale: cardAnimations[1].scale },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  shadows.medium,
                  { backgroundColor: colors.background },
                ]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[1], "Profile")}
              >
                <LinearGradient
                  colors={["#3498db", "#2980b9"]}
                  style={styles.cardIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={30}
                    color="#FFF"
                  />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.primary, fontFamily: fonts.bold },
                    ]}
                  >
                    Perfil
                  </Text>
                  <Text
                    style={[
                      styles.cardDescription,
                      { color: colors.muted, fontFamily: fonts.regular },
                    ]}
                  >
                    Gerencie suas informações pessoais
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardAnimations[2].opacity,
                  transform: [
                    { translateY: cardAnimations[2].translateY },
                    { scale: cardAnimations[2].scale },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  shadows.medium,
                  { backgroundColor: colors.background },
                ]}
                activeOpacity={0.8}
                onPress={() => handleCardPress(cardAnimations[2], "About")}
              >
                <LinearGradient
                  colors={["#27ae60", "#2ecc71"]}
                  style={styles.cardIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name="information"
                    size={30}
                    color="#FFF"
                  />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.primary, fontFamily: fonts.bold },
                    ]}
                  >
                    Sobre Nós
                  </Text>
                  <Text
                    style={[
                      styles.cardDescription,
                      { color: colors.muted, fontFamily: fonts.regular },
                    ]}
                  >
                    Conheça nossa história e missão
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </Animated.View>

            {(!subscription || subscription === "FREE") && (
              <Animated.View
                style={[
                  styles.cardWrapper,
                  {
                    opacity: cardAnimations[3].opacity,
                    transform: [
                      { translateY: cardAnimations[3].translateY },
                      { scale: cardAnimations[3].scale },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.VIPCard, shadows.medium]}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleCardPress(cardAnimations[3], "ProSubscription")
                  }
                >
                  <LinearGradient
                    colors={["#F2994A", "#F2C94C"]}
                    style={styles.VIPCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.VIPContent}>
                      <MaterialCommunityIcons
                        name="crown"
                        size={40}
                        color="#FFF"
                      />
                      <Text
                        style={[
                          styles.VIPTitle,
                          { fontFamily: fonts.bold },
                        ]}
                      >
                        ATUALIZE PARA VIP
                      </Text>
                      <Text
                        style={[
                          styles.VIPDescription,
                          { fontFamily: fonts.regular },
                        ]}
                      >
                        Desbloqueie recursos exclusivos e aumente suas chances
                        de sucesso!
                      </Text>
                      <View style={styles.VIPButton}>
                        <Text
                          style={[
                            styles.VIPButtonText,
                            { fontFamily: fonts.semibold },
                          ]}
                        >
                          VER PLANOS
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color="#FFF"
                        />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            { color: colors.muted, fontFamily: fonts.regular },
          ]}
        >
          © 2025 CHAMAGOL • Todos os direitos reservados
        </Text>
      </View>

      <TermModal
        visible={showTermModal}
        onAccepted={() => setShowTermModal(false)}
      />
    </SafeAreaView>
  );
}

export default function HomeScreen(props: Props) {
  return (
    <CustomAlertProvider>
      <HomeContent {...props} />
    </CustomAlertProvider>
  );
}

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
    marginBottom: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
  },
  usernameText: {
    fontSize: 16,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  subscriptionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  lastLoginText: {
    fontSize: 12,
    marginBottom: 16,
  },
  cardsContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  cardWrapper: {
    marginBottom: 16,
    width: "100%",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
  },
  VIPCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 10,
  },
  VIPCardGradient: {
    width: "100%",
    padding: 20,
  },
  VIPContent: {
    alignItems: "center",
  },
  VIPTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  VIPDescription: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
  },
  VIPButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  VIPButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 5,
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

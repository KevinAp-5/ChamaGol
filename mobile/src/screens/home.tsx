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

const { width } = Dimensions.get("window");

// ─── Dados dos cards ────────────────────────────────────────────────────────
const MENU_CARDS = [
  {
    id: "timeline",
    nav: "Timeline" as keyof RootStackParamList,
    icon: "fire" as const,
    label: "Sinais",
    description: "Dicas e análises esportivas em tempo real",
    // Cor dentro do design system: vermelho/destaque
    gradientColors: ["#E53935", "#B71C1C"] as [string, string],
    accentColor: "#E53935",
  },
  {
    id: "profile",
    nav: "Profile" as keyof RootStackParamList,
    icon: "account-circle" as const,
    label: "Meu Perfil",
    description: "Gerencie suas informações pessoais",
    gradientColors: ["#333333", "#111111"] as [string, string],
    accentColor: "#555555",
  },
  {
    id: "about",
    nav: "About" as keyof RootStackParamList,
    icon: "information-outline" as const,
    label: "Sobre Nós",
    description: "Nossa história e missão",
    gradientColors: ["#333333", "#111111"] as [string, string],
    accentColor: "#555555",
  },
];

function HomeContent({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();
  const { showAlert } = useCustomAlert();
  const [showTermModal, setShowTermModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionType>(null);
  const [username, setUsername] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [termLoaded, setTermLoaded] = useState(false);

  // ─── Animations ─────────────────────────────────────────────────────────────
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const cardAnims = MENU_CARDS.map(() => ({
    scale: useRef(new Animated.Value(1)).current,
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(24)).current,
  }));
  const vipAnim = {
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(24)).current,
    scale: useRef(new Animated.Value(1)).current,
    shimmer: useRef(new Animated.Value(0)).current,
  };

  // ─── Entrance animations ─────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    cardAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(200 + i * 90),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 380, useNativeDriver: true }),
        ]),
      ]).start();
    });

    // VIP card shimmer loop
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(vipAnim.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(vipAnim.translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(vipAnim.shimmer, { toValue: 1, duration: 1600, useNativeDriver: true }),
          Animated.timing(vipAnim.shimmer, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  // ─── Data fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    const loadInitialSubscription = async () => {
      try {
        const storedSubscription = await AsyncStorage.getItem("subscription");
        if (storedSubscription) setSubscription(storedSubscription as SubscriptionType);
      } catch {}
    };
    loadInitialSubscription();
  }, []);

  const fetchSubscriptionAlert = async (currentSubscription: SubscriptionType) => {
    if (!currentSubscription || currentSubscription === "FREE") return;
    try {
      const alertFlag = await AsyncStorage.getItem("subscriptionAlertFlag");
      if (alertFlag === "1") return;
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return;
      const response = await api.get("users/subscription/alert", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const serverAlert = !!(response.status === 200 && response.data === true);
      if (serverAlert) {
        showAlert("Lembre-se de renovar para continuar aproveitando os benefícios VIP.", {
          title: "Sua assinatura vai expirar em breve",
        });
        await AsyncStorage.setItem("subscriptionAlertFlag", "1");
      }
    } catch {}
  };

  const fetchSubscription = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) { setSubscription(null); return; }
      const response = await api.get("users/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let userSubscription: SubscriptionType = null;
      if (response.status === 200 && response.data?.userSubscription) {
        userSubscription = String(response.data.userSubscription) as SubscriptionType;
        await AsyncStorage.setItem("subscription", userSubscription);
        setSubscription(userSubscription);
      } else {
        setSubscription(null);
        await AsyncStorage.removeItem("subscription");
      }
      await fetchSubscriptionAlert(userSubscription);
    } catch {
      setSubscription(null);
    }
  };

  useEffect(() => {
    const setFlagsAndFetch = async () => {
      try {
        const termFlag = await AsyncStorage.getItem("termFlag");
        const loaded = termFlag === "1";
        setTermLoaded(loaded);
        await fetchSubscription();
        if (!loaded) await checkTermAcceptance();
      } catch { setTermLoaded(false); }
    };
    setFlagsAndFetch();
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const tokenResponse = await api.get("/auth/token/validate");
        if (!tokenResponse) {
          showAlert("Acesso atualizado, faça login novamente para continuar!", { title: "Alerta" });
          navigation.navigate("Login");
        }
      } catch {}
    };
    validateToken();

    const getUserInfo = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) setUsername(storedUsername);
        const lastLoginDate = await AsyncStorage.getItem("lastLogin");
        if (lastLoginDate) {
          setLastLogin(lastLoginDate);
        } else {
          const now = new Date().toISOString();
          await AsyncStorage.setItem("lastLogin", now);
          setLastLogin(now);
        }
      } catch {}
    };
    getUserInfo();
  }, []);

  const checkTermAcceptance = async () => {
    if (termLoaded) return;
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return;
      const response = await api.get("acceptance/has-accepted-latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data === false) setShowTermModal(true);
      await AsyncStorage.setItem("termFlag", "1");
      setTermLoaded(true);
      if (response.status === 404) showAlert("Erro ao validar usuário, faça login novamente", { title: "Erro" });
    } catch {
      showAlert("Erro ao verificar aceite dos termos.", { title: "Erro" });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscription();
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diffDays = Math.floor(Math.abs(new Date().getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    return `há ${diffDays} dias`;
  };

  const handleCardPress = (anim: typeof cardAnims[0], nav: keyof RootStackParamList) => {
    Animated.sequence([
      Animated.timing(anim.scale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.timing(anim.scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start(() => navigation.navigate(nav));
  };

  const handleVIPPress = () => {
    Animated.sequence([
      Animated.timing(vipAnim.scale, { toValue: 0.97, duration: 90, useNativeDriver: true }),
      Animated.timing(vipAnim.scale, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start(() => navigation.navigate("ProSubscription"));
  };

  // ─── Subscription badge ───────────────────────────────────────────────────
  const getSubscriptionConfig = () => {
    if (subscription === "PRO") return { text: "PRO", bgColors: ["#FFC107", "#FF8F00"] as [string, string], icon: "crown" as const };
    if (subscription === "VIP") return { text: "VIP", bgColors: ["#8E24AA", "#6A1B9A"] as [string, string], icon: "diamond-stone" as const };
    return { text: "GRATUITO", bgColors: ["#444444", "#333333"] as [string, string], icon: "account-outline" as const };
  };
  const subConfig = getSubscriptionConfig();

  const isFree = !subscription || subscription === "FREE";

  // Shimmer interpolation for VIP card highlight
  const shimmerOpacity = vipAnim.shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.32] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#E53935"]}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={["#000000", "#1a0000", "#000000"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.headerInner,
              { opacity: headerFade, transform: [{ translateY: headerSlide }] },
            ]}
          >
            {/* Logo compacto + Badge ao lado */}
            <View style={styles.headerTop}>
              <Image
                source={require("../assets/logo_white_label.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <LinearGradient colors={subConfig.bgColors} style={styles.subscriptionBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <MaterialCommunityIcons name={subConfig.icon} size={13} color="#FFF" />
                <Text style={[styles.subscriptionText, { fontFamily: fonts.bold }]}>{subConfig.text}</Text>
              </LinearGradient>
            </View>

            {/* Saudação */}
            <View style={styles.greetingBlock}>
              <Text style={[styles.greetingSmall, { fontFamily: fonts.regular }]}>
                Bem-vindo de volta{username ? "," : ""}
              </Text>
              {username ? (
                <Text style={[styles.greetingName, { fontFamily: fonts.bold }]}>
                  {username} 👋
                </Text>
              ) : null}
            </View>

            {/* Título principal */}
            <Text style={[styles.heroTitle, { fontFamily: fonts.extraBold }]}>
              UNIVERSO{"\n"}
              <Text style={[styles.heroTitleAccent, { fontFamily: fonts.extraBold }]}>CHAMAGOL</Text>
            </Text>

            {/* Divider decorativo */}
            <View style={styles.heroDivider}>
              <View style={styles.heroDividerLine} />
              <MaterialCommunityIcons name="soccer" size={14} color="#E53935" />
              <View style={styles.heroDividerLine} />
            </View>

            {/* Meta info row */}
            <View style={styles.metaRow}>
              {lastLogin && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="#FFFFFF88" />
                  <Text style={[styles.metaChipText, { fontFamily: fonts.regular }]}>
                    Acesso {formatDate(lastLogin)}
                  </Text>
                </View>
              )}
              {isFree && (
                <TouchableOpacity
                  style={styles.upgradeChip}
                  onPress={() => navigation.navigate("ProSubscription")}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="arrow-up-circle" size={12} color="#F2994A" />
                  <Text style={[styles.upgradeChipText, { fontFamily: fonts.semibold }]}>Fazer upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* ── CARDS CONTAINER ───────────────────────────────────────────── */}
        <View style={styles.cardsContainer}>

          {/* Cards de navegação */}
          {MENU_CARDS.map((card, index) => {
            const anim = cardAnims[index];
            const isPrimary = index === 0; // Sinais é o destaque
            return (
              <Animated.View
                key={card.id}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: anim.opacity,
                    transform: [{ translateY: anim.translateY }, { scale: anim.scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.card,
                    isPrimary && styles.cardPrimary,
                    { shadowColor: isPrimary ? "#E53935" : "#000" },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleCardPress(anim, card.nav)}
                >
                  {isPrimary ? (
                    // Card primário — layout diferenciado com gradiente completo
                    <LinearGradient
                      colors={["#E53935", "#B71C1C"]}
                      style={styles.cardPrimaryGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.cardPrimaryContent}>
                        <View style={styles.cardPrimaryLeft}>
                          <View style={styles.cardPrimaryIconWrap}>
                            <MaterialCommunityIcons name={card.icon} size={26} color="#FFF" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.cardPrimaryLabel, { fontFamily: fonts.bold }]}>
                              {card.label}
                            </Text>
                            <Text style={[styles.cardPrimaryDesc, { fontFamily: fonts.regular }]}>
                              {card.description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.cardPrimaryChevron}>
                          <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    // Cards secundários — clean com accent bar
                    <>
                      {/* Barra lateral de acento */}
                      <View style={styles.cardAccentBar} />
                      <View style={styles.cardInner}>
                        <View style={[styles.cardIconWrap, { backgroundColor: "#F5F5F5" }]}>
                          <MaterialCommunityIcons name={card.icon} size={22} color="#222" />
                        </View>
                        <View style={styles.cardTextBlock}>
                          <Text style={[styles.cardLabel, { fontFamily: fonts.bold }]}>{card.label}</Text>
                          <Text style={[styles.cardDesc, { fontFamily: fonts.regular }]}>{card.description}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDBDBD" />
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          {/* ── VIP UPGRADE CARD (só FREE) ────────────────────────────── */}
          {isFree && (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: vipAnim.opacity,
                  transform: [{ translateY: vipAnim.translateY }, { scale: vipAnim.scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.vipCardOuter}
                activeOpacity={0.88}
                onPress={handleVIPPress}
              >
                <LinearGradient
                  colors={["#1a0a00", "#2d1200", "#1a0a00"]}
                  style={styles.vipGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Shimmer overlay */}
                  <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: shimmerOpacity }]}>
                    <LinearGradient
                      colors={["transparent", "#F2994A44", "transparent"]}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  </Animated.View>

                  {/* Borda dourada sutil */}
                  <View style={styles.vipBorderOverlay} />

                  <View style={styles.vipContent}>
                    {/* Ícone + Título */}
                    <View style={styles.vipTitleRow}>
                      <View style={styles.vipCrownWrap}>
                        <MaterialCommunityIcons name="crown" size={20} color="#F2994A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.vipEyebrow, { fontFamily: fonts.semibold }]}>
                          PLANO VIP
                        </Text>
                        <Text style={[styles.vipTitle, { fontFamily: fonts.extraBold }]}>
                          Aumente seus resultados
                        </Text>
                      </View>
                    </View>

                    {/* Benefícios — lista compacta */}
                    <View style={styles.vipBenefits}>
                      {[
                        { icon: "check-circle", text: "Sinais exclusivos em tempo real" },
                        { icon: "check-circle", text: "Análises avançadas dos jogos" },
                        { icon: "check-circle", text: "Suporte prioritário" },
                      ].map((b, i) => (
                        <View key={i} style={styles.vipBenefitRow}>
                          <MaterialCommunityIcons name={b.icon as any} size={14} color="#F2994A" />
                          <Text style={[styles.vipBenefitText, { fontFamily: fonts.regular }]}>{b.text}</Text>
                        </View>
                      ))}
                    </View>

                    {/* CTA */}
                    <View style={styles.vipCTA}>
                      <LinearGradient
                        colors={["#F2994A", "#E53935"]}
                        style={styles.vipButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={[styles.vipButtonText, { fontFamily: fonts.bold }]}>
                          VER PLANOS
                        </Text>
                        <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
                      </LinearGradient>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <Text style={[styles.footer, { fontFamily: fonts.regular }]}>
          © 2026 CHAMAGOL • Todos os direitos reservados
        </Text>
      </ScrollView>

      <TermModal visible={showTermModal} onAccepted={() => setShowTermModal(false)} />
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#F4F4F4",
    paddingBottom: 32,
  },

  // ── Header
  headerGradient: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerInner: {
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: width * 0.36,
    height: width * 0.13,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subscriptionText: {
    color: "#FFF",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  greetingBlock: {
    gap: 2,
    marginTop: 4,
  },
  greetingSmall: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  greetingName: {
    color: "#FFF",
    fontSize: 19,
  },

  heroTitle: {
    color: "#FFF",
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  heroTitleAccent: {
    color: "#E53935",
  },

  heroDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 2,
  },
  heroDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaChipText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  upgradeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(242,153,74,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(242,153,74,0.35)",
  },
  upgradeChipText: {
    color: "#F2994A",
    fontSize: 11,
  },

  // ── Cards container
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  cardWrapper: {
    width: "100%",
  },

  // Card primário (Sinais)
  cardPrimary: {
    borderRadius: 16,
    overflow: "hidden",
    // Sombra vermelha suave
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardPrimaryGradient: {
    borderRadius: 16,
  },
  cardPrimaryContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  cardPrimaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardPrimaryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardPrimaryLabel: {
    color: "#FFF",
    fontSize: 17,
    marginBottom: 3,
  },
  cardPrimaryDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 16,
  },
  cardPrimaryChevron: {
    marginLeft: 8,
  },

  // Cards secundários
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAccentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#E0E0E0",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 16,
    gap: 14,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextBlock: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    color: "#111",
    fontSize: 15,
  },
  cardDesc: {
    color: "#888",
    fontSize: 12,
    lineHeight: 16,
  },

  // ── VIP Card
  vipCardOuter: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#F2994A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  vipGradient: {
    borderRadius: 18,
    padding: 20,
  },
  vipBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(242,153,74,0.3)",
  },
  vipContent: {
    gap: 16,
  },
  vipTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  vipCrownWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(242,153,74,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(242,153,74,0.25)",
  },
  vipEyebrow: {
    color: "#F2994A",
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  vipTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
  },
  vipBenefits: {
    gap: 8,
  },
  vipBenefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vipBenefitText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  vipCTA: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  vipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  vipButtonText: {
    color: "#FFF",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // ── Footer
  footer: {
    color: "#AAAAAA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 28,
    marginBottom: 8,
  },
});
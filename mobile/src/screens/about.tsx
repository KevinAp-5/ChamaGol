import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/theme";
import { CustomAlertProvider, useCustomAlert } from "../components/CustomAlert";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "About">;

const { width } = Dimensions.get("window");

const statsData = [
  { number: "10+", label: "Estados", icon: "map-marker-radius" as const },
  { number: "5M+", label: "Usuários", icon: "account-group" as const },
  { number: "20+", label: "Parceiros", icon: "handshake" as const },
];

const valuesData = [
  {
    icon: "shield-check" as const,
    title: "Confiança",
    description: "Análises honestas e transparentes para você tomar as melhores decisões.",
  },
  {
    icon: "lightning-bolt" as const,
    title: "Agilidade",
    description: "Sinais em tempo real para que você nunca perca uma oportunidade.",
  },
  {
    icon: "trophy" as const,
    title: "Resultado",
    description: "Foco em entregar dados que realmente fazem diferença na sua performance.",
  },
];

function AboutContent({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { showAlert } = useCustomAlert();

  // ─── Animations ─────────────────────────────────────────────────────────
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const statsAnims = statsData.map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0.8)).current,
  }));
  const valuesAnims = valuesData.map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value(-20)).current,
  }));

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();

    // Content fade in
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Stats stagger
    statsAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(300 + i * 120),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    });

    // Values stagger
    valuesAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(500 + i * 100),
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(anim.translateX, { toValue: 0, duration: 380, useNativeDriver: true }),
        ]),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#000000", "#1a0000", "#000000"]}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <Animated.View
            style={[
              styles.headerInner,
              { opacity: headerFade, transform: [{ translateY: headerSlide }] },
            ]}
          >
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.headerTextBlock}>
              <Text style={[styles.headerTitle, { fontFamily: fonts.extraBold }]}>
                SOBRE NÓS
              </Text>
              <View style={styles.headerDivider}>
                <View style={styles.headerDividerLine} />
                <MaterialCommunityIcons name="soccer" size={12} color="#E53935" />
                <View style={styles.headerDividerLine} />
              </View>
              <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
                Conheça o universo ChamaGol
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: contentFade,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Logo block ─────────────────────────────────────────────── */}
          <View style={styles.logoBlock}>
            <View style={styles.logoWrap}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.appTitle, { fontFamily: fonts.extraBold }]}>
              CHAMA<Text style={{ color: "#E53935" }}>GOL</Text>
            </Text>
            <Text style={[styles.tagline, { fontFamily: fonts.regular }]}>
              Seu universo esportivo
            </Text>
          </View>

          {/* ── Stats row ──────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            {statsData.map((stat, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.statWrap,
                  {
                    opacity: statsAnims[index].opacity,
                    transform: [{ scale: statsAnims[index].scale }],
                  },
                ]}
              >
                {index === 1 ? (
                  // Stat central em destaque vermelho
                  <LinearGradient
                    colors={["#E53935", "#B71C1C"]}
                    style={[styles.statBox, styles.statBoxFeatured]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons name={stat.icon} size={20} color="rgba(255,255,255,0.8)" />
                    <Text style={[styles.statNumber, { fontFamily: fonts.extraBold, color: "#FFF" }]}>
                      {stat.number}
                    </Text>
                    <Text style={[styles.statLabel, { fontFamily: fonts.medium, color: "rgba(255,255,255,0.85)" }]}>
                      {stat.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.statBox, styles.statBoxDefault]}>
                    <MaterialCommunityIcons name={stat.icon} size={18} color="#E53935" />
                    <Text style={[styles.statNumber, { fontFamily: fonts.extraBold, color: "#111" }]}>
                      {stat.number}
                    </Text>
                    <Text style={[styles.statLabel, { fontFamily: fonts.medium, color: "#888" }]}>
                      {stat.label}
                    </Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>

          {/* ── Nossa História ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons name="book-open-variant" size={18} color="#E53935" />
              </View>
              <Text style={[styles.sectionTitle, { fontFamily: fonts.bold }]}>
                Nossa História
              </Text>
            </View>
            <View style={styles.sectionAccentBar} />
            <Text style={[styles.bodyText, { fontFamily: fonts.regular }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor
              eleifend aliquet. Duis malesuada in mi a tristique. Nam suscipit mollis
              libero nec fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Vivamus sed vehicula neque.
            </Text>
            <Text style={[styles.bodyText, { fontFamily: fonts.regular }]}>
              Pellentesque habitant morbi tristique senectus et netus et malesuada
              fames ac turpis egestas. Vestibulum ante ipsum primis in faucibus orci
              luctus et ultrices posuere cubilia curae; Proin rhoncus, justo ac
              interdum ullamcorper, libero ante interdum eros.
            </Text>
          </View>

          {/* ── Nossos Valores (substituindo "Missão" simples) ─────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrap}>
                <MaterialCommunityIcons name="target" size={18} color="#E53935" />
              </View>
              <Text style={[styles.sectionTitle, { fontFamily: fonts.bold }]}>
                Nossa Missão
              </Text>
            </View>
            <View style={styles.sectionAccentBar} />

            <Text style={[styles.bodyText, { fontFamily: fonts.regular }]}>
              Donec nec vulputate metus, eu tincidunt augue. Maecenas finibus urna
              vel purus tempor, vel vehicula magna placerat.
            </Text>

            {/* Values cards */}
            {valuesData.map((val, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.valueCard,
                  {
                    opacity: valuesAnims[i].opacity,
                    transform: [{ translateX: valuesAnims[i].translateX }],
                  },
                ]}
              >
                <View style={styles.valueIconWrap}>
                  <MaterialCommunityIcons name={val.icon} size={20} color="#E53935" />
                </View>
                <View style={styles.valueTextBlock}>
                  <Text style={[styles.valueTitle, { fontFamily: fonts.bold }]}>{val.title}</Text>
                  <Text style={[styles.valueDesc, { fontFamily: fonts.regular }]}>{val.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* ── Contato ────────────────────────────────────────────────── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              showAlert("Whatsapp: ", {
                title: "Suporte",
                confirmText: "Fechar",
              })
            }
          >
            <LinearGradient
              colors={["#E53935", "#B71C1C"]}
              style={styles.contactButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="whatsapp" size={20} color="#FFF" />
              <Text style={[styles.contactButtonText, { fontFamily: fonts.bold }]}>
                ENTRAR EM CONTATO
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={[styles.footerText, { fontFamily: fonts.regular }]}>
              © 2026 CHAMAGOL • Todos os direitos reservados
            </Text>
            <View style={styles.versionChip}>
              <MaterialCommunityIcons name="tag-outline" size={11} color="#BDBDBD" />
              <Text style={[styles.versionText, { fontFamily: fonts.regular }]}>
                Versão 2.5.1
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export default function AboutScreen(props: Props) {
  return (
    <CustomAlertProvider>
      <AboutContent {...props} />
    </CustomAlertProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ── Header
  gradientHeader: {
    paddingBottom: 36,
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTextBlock: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    color: "#FFF",
    letterSpacing: 2,
    marginBottom: 10,
  },
  headerDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "60%",
    marginBottom: 8,
  },
  headerDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3,
  },

  // ── Content card
  contentContainer: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 36,
  },

  // ── Logo block
  logoBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 14,
  },
  logo: {
    width: 66,
    height: 66,
  },
  appTitle: {
    fontSize: 22,
    color: "#111",
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: "#888",
  },

  // ── Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    gap: 10,
  },
  statWrap: {
    flex: 1,
  },
  statBox: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  statBoxDefault: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  statBoxFeatured: {
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    // Slightly taller to create visual hierarchy
    paddingVertical: 18,
  },
  statNumber: {
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // ── Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(229,57,53,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    color: "#111",
  },
  sectionAccentBar: {
    width: 40,
    height: 3,
    backgroundColor: "#E53935",
    borderRadius: 4,
    marginBottom: 16,
    marginLeft: 44,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 23,
    color: "#444",
    marginBottom: 14,
  },

  // ── Value cards
  valueCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    // Subtle left accent
    borderLeftWidth: 3,
    borderLeftColor: "#E53935",
  },
  valueIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "rgba(229,57,53,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  valueTextBlock: {
    flex: 1,
    gap: 3,
  },
  valueTitle: {
    fontSize: 14,
    color: "#111",
  },
  valueDesc: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },

  // ── Contact button
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 14,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },

  // ── Footer
  footer: {
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: "#AAAAAA",
    textAlign: "center",
  },
  versionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  versionText: {
    fontSize: 10,
    color: "#BDBDBD",
  },
});
import { Client } from "@stomp/stompjs";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  AppState,
  AppStateStatus,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import SockJS from "sockjs-client";
import FireGif from "../components/fire";
import * as SecureStore from "expo-secure-store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, BASE_URL } from "../config/Api";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type People = "ALL" | "VIP" | "FREE";

type Message = {
  id: string;
  content: string;
  created_at: string;
  people: People;
  isNew?: boolean;
};

type Props = NativeStackScreenProps<RootStackParamList, "Timeline">;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Merge duas listas sem duplicatas, mantendo ordem por created_at.
 */
function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const ids = new Set(existing.map((m) => m.id));
  const merged = [
    ...existing,
    ...incoming.filter((m) => !ids.has(m.id)),
  ];
  merged.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return merged;
}

// ─── Formatted text ─────────────────────────────────────────────────────────

const renderFormattedText = (text: string, colors: any, fonts: any) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <Text style={[styles.messageText, { color: colors.primary, fontFamily: fonts.regular }]}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontFamily: fonts.bold }}>
              {part.slice(2, -2)}
            </Text>
          );
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <Text key={index} style={{ fontFamily: fonts.medium, opacity: 0.9 }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// ─── MessageCard ─────────────────────────────────────────────────────────────

const MessageCard = React.memo(function MessageCard({
  item,
  index,
  userSubscription,
  navigation,
  colors,
  fonts,
  spacing,
  borderRadius,
  shadows,
  messagesLength,
}: any) {
  const isVIPMessage = item.people === "VIP";
  const isLast = index === messagesLength - 1;

  if (isVIPMessage && userSubscription !== "VIP") {
    return (
      <View style={[styles.lockedCard, { marginBottom: isLast ? spacing.xl : spacing.md }]}>
        <LinearGradient colors={["#1a1a1a", "#0a0a0a"]} style={styles.lockedCardGradient}>
          <View style={styles.vipShineEffect}>
            <LinearGradient
              colors={["transparent", "rgba(255, 215, 0, 0.1)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shineGradient}
            />
          </View>
          <View style={styles.vipPremiumBadge}>
            <LinearGradient
              colors={["#FFD700", "#FFA500", "#FF8C00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vipPremiumGradient}
            >
              <MaterialCommunityIcons name="crown" size={16} color="#000" />
              <Text style={[styles.vipPremiumText, { fontFamily: fonts.extrabold }]}>
                CONTEÚDO VIP
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.lockedContent}>
            <View style={styles.lockIconContainer}>
              <View style={styles.lockIconGlow}>
                <LinearGradient
                  colors={["rgba(229, 57, 53, 0.3)", "rgba(229, 57, 53, 0)"]}
                  style={styles.glowCircle}
                />
              </View>
              <View style={styles.lockIconWrapper}>
                <MaterialCommunityIcons name="lock" size={48} color="#FFD700" />
              </View>
            </View>
            <Text style={[styles.lockedTitle, { color: "#FFFFFF", fontFamily: fonts.bold }]}>
              Mensagem Exclusiva VIP
            </Text>
            <Text style={[styles.lockedDescription, { color: "rgba(255, 255, 255, 0.7)", fontFamily: fonts.regular }]}>
              Desbloqueie conteúdo premium, análises exclusivas e muito mais
            </Text>
            <View style={styles.vipFeatures}>
              {["Acesso a todas as mensagens", "Conteúdo exclusivo e análises", "Suporte prioritário"].map((f) => (
                <View key={f} style={styles.vipFeatureItem}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
                  <Text style={[styles.vipFeatureText, { fontFamily: fonts.medium }]}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={() => navigation.navigate("ProSubscription")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#E53935", "#B71C1C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.unlockButtonGradient}
              >
                <MaterialCommunityIcons name="crown" size={22} color="#FFD700" />
                <Text style={[styles.unlockButtonText, { fontFamily: fonts.bold }]}>ASSINAR AGORA</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageCard,
        {
          backgroundColor: colors.card,
          marginBottom: isLast ? spacing.xl : spacing.md,
          ...shadows.medium,
        },
      ]}
    >
      <View style={[styles.colorBorder, { backgroundColor: isVIPMessage ? "#FFD700" : colors.secondary }]} />
      {isVIPMessage && (
        <View style={styles.vipBadgeCard}>
          <LinearGradient
            colors={["#8E24AA", "#7B1FA2", "#6A1B9A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vipBadgeCardGradient}
          >
            <MaterialCommunityIcons name="crown" size={14} color="#FFF" />
            <Text style={[styles.vipBadgeCardText, { fontFamily: fonts.extrabold }]}>VIP</Text>
          </LinearGradient>
        </View>
      )}
      {item.isNew && (
        <View style={styles.newIndicatorTop}>
          <FireGif />
          <Text style={[styles.newText, { fontFamily: fonts.bold }]}>NOVO</Text>
        </View>
      )}
      <View style={styles.messageContent}>
        {renderFormattedText(item.content, colors, fonts)}
      </View>
      <View style={styles.timestamp}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={12} color={colors.muted} />
        <Text style={[styles.timestampText, { color: colors.muted, fontFamily: fonts.regular }]}>
          {moment(item.created_at).format("DD/MM/YYYY • HH:mm")}
        </Text>
      </View>
    </View>
  );
});

// ─── ConnectionIndicator ─────────────────────────────────────────────────────

const ConnectionIndicator = ({ isConnected, fonts }: any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isConnected]);

  return (
    <View style={styles.connectionIndicator}>
      <Animated.View
        style={[
          styles.connectionDot,
          {
            backgroundColor: isConnected ? "#34C759" : "#FF3B30",
            transform: [{ scale: isConnected ? pulseAnim : 1 }],
          },
        ]}
      />
      <Text style={[styles.connectionText, { color: "rgba(255,255,255,0.9)", fontFamily: fonts.medium }]}>
        {isConnected ? "Conectado" : "Desconectado"}
      </Text>
    </View>
  );
};

// ─── TimelineScreen ───────────────────────────────────────────────────────────

export default function TimelineScreen({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();

  // ── State ──
  const [userSubscription, setUserSubscription] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // ── ETAPA 4: controle de paginação e sync ──
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const lastMessageIdRef = useRef<number | null>(null); // useRef evita stale closure no AppState

  const flatListRef = useRef<FlatList>(null);
  const newMessageAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // ── Fade in ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Subscription ──
  useEffect(() => {
    AsyncStorage.getItem("subscription").then((v) => {
      if (v) setUserSubscription(v);
    });
  }, []);

  // ── Token ──
  useEffect(() => {
    SecureStore.getItemAsync("accessToken").then((storedToken) => {
      if (storedToken) {
        setToken(storedToken);
      } else {
        showCustomAlert("Sessão expirada. Faça login novamente.", { title: "Acesso negado" });
        navigation.navigate("Login");
      }
      setIsTokenLoaded(true);
    });
  }, []);

  // ── Validate token ──
  useEffect(() => {
    if (!isTokenLoaded || !token) return;
    api.get("/auth/token/validate").catch(() => {
      showCustomAlert("Não foi possível validar sua sessão.", { title: "Erro" });
    });
  }, [isTokenLoaded, token]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — Carregamento HTTP inicial
  // Carrega mensagens ANTES de conectar o WebSocket.
  // ─────────────────────────────────────────────────────────────────────────
  const fetchInitialMessages = useCallback(async () => {
    if (!token) return;
    setIsLoadingInitial(true);
    try {
      const response = await api.get("/message", {
        params: { page: 0, size: 20 },
      });
      const data: Message[] = response.data.content ?? response.data;
      if (data.length > 0) {
        const sorted = [...data].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sorted);
        lastMessageIdRef.current = Number(sorted[sorted.length - 1].id);
      }
      setHasMorePages((response.data.totalPages ?? 1) > 1);
      setCurrentPage(0);
    } catch (err) {
      console.error("[Timeline] Erro no carregamento inicial:", err);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — Sync ao voltar ao foreground (AppState)
  // Busca apenas mensagens novas usando ?afterId=lastMessageId
  // ─────────────────────────────────────────────────────────────────────────
  const fetchAfterLastId = useCallback(async () => {
    if (!token || lastMessageIdRef.current === null) return;
    try {
      const response = await api.get("/message", {
        params: { afterId: lastMessageIdRef.current },
      });
      const incoming: Message[] = response.data.content ?? response.data;
      if (incoming.length === 0) return;

      setMessages((prev) => {
        const merged = mergeMessages(prev, incoming);
        // Atualiza lastMessageId com o maior ID da lista mesclada
        const maxId = Math.max(...merged.map((m) => Number(m.id)));
        lastMessageIdRef.current = maxId;
        return merged;
      });

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error("[Timeline] Erro ao sincronizar mensagens:", err);
    }
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — Paginação: carregar mensagens antigas ao rolar para cima
  // ─────────────────────────────────────────────────────────────────────────
  const fetchOlderMessages = useCallback(async () => {
    if (!token || isLoadingMore || !hasMorePages) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const response = await api.get("/message", {
        params: { page: nextPage, size: 20 },
      });
      const older: Message[] = response.data.content ?? response.data;
      if (older.length === 0) {
        setHasMorePages(false);
        return;
      }
      setMessages((prev) => mergeMessages(prev, older));
      setCurrentPage(nextPage);
      setHasMorePages(nextPage + 1 < (response.data.totalPages ?? 1));
    } catch (err) {
      console.error("[Timeline] Erro ao carregar mensagens antigas:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [token, isLoadingMore, hasMorePages, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — AppState: dispara sync quando app volta ao foreground
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          fetchAfterLastId();
        }
      }
    );
    return () => subscription.remove();
  }, [fetchAfterLastId]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — Fluxo correto: HTTP primeiro, WebSocket depois
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isTokenLoaded && token) {
      fetchInitialMessages();
    }
  }, [isTokenLoaded, token]);

  // WebSocket só conecta após token carregado
  useEffect(() => {
    if (!isTokenLoaded || !token) return;

    setIsConnecting(true);
    const wsUrl = `${BASE_URL}/ws/chat?token=${token}`;
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setStompClient(client);
        setIsConnecting(false);
        setIsConnected(true);
        (client as any).heartbeatIntervalId = setInterval(() => {
          client.publish({ destination: "/app/heartbeat", body: "{}" });
        }, 20000);
      },
      onDisconnect: () => {
        setStompClient(null);
        setIsConnected(false);
        clearInterval((client as any).heartbeatIntervalId);
      },
      onStompError: (frame) => {
        console.error("[STOMP] broker error:", frame?.headers?.message);
        setIsConnecting(false);
        setIsConnected(false);
      },
    });

    client.onWebSocketClose = () => {
      setIsConnected(false);
      clearInterval((client as any).heartbeatIntervalId);
    };

    client.onWebSocketError = () => {
      setIsConnecting(false);
      setIsConnected(false);
      clearInterval((client as any).heartbeatIntervalId);
    };

    client.activate();
    return () => {
      client.deactivate();
      clearInterval((client as any).heartbeatIntervalId);
    };
  }, [isTokenLoaded, token]);

  // ─────────────────────────────────────────────────────────────────────────
  // ETAPA 4 — WebSocket: apenas atualização incremental + deduplicação
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!stompClient) return;

    const sub = stompClient.subscribe("/topic/messages", (msg) => {
      if (!msg.body) return;
      const messageDTO: Message = JSON.parse(msg.body);

      const shouldAdd =
        messageDTO.people === "ALL" ||
        messageDTO.people === "VIP"; // card bloqueado para FREE

      if (!shouldAdd) return;

      const newMessage: Message = {
        ...messageDTO,
        id: messageDTO.id.toString(),
        isNew: true,
      };

      setMessages((prev) => {
        // ── DEDUPLICAÇÃO por ID (regra de ouro) ──
        if (prev.some((m) => m.id === newMessage.id)) return prev;

        // Atualiza lastMessageId
        const incomingId = Number(newMessage.id);
        if (lastMessageIdRef.current === null || incomingId > lastMessageIdRef.current) {
          lastMessageIdRef.current = incomingId;
        }

        return [...prev, newMessage];
      });

      // Animação de nova mensagem
      Animated.sequence([
        Animated.spring(newMessageAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(newMessageAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      // Remove flag isNew depois de 3s
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, isNew: false } : m))
        );
      }, 3000);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => sub.unsubscribe();
  }, [stompClient, userSubscription]);

  // ─────────────────────────────────────────────────────────────────────────
  // Pull-to-refresh: reseta e recarrega do zero
  // ─────────────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setMessages([]);
    lastMessageIdRef.current = null;
    await fetchInitialMessages();
    setIsRefreshing(false);
  }, [fetchInitialMessages]);

  // ─────────────────────────────────────────────────────────────────────────
  // Renderização
  // ─────────────────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageCard
        item={item}
        index={index}
        userSubscription={userSubscription}
        navigation={navigation}
        colors={colors}
        fonts={fonts}
        spacing={spacing}
        borderRadius={borderRadius}
        shadows={shadows}
        messagesLength={messages.length}
      />
    ),
    [userSubscription, navigation, colors, fonts, spacing, borderRadius, shadows, messages.length]
  );

  const renderHeader = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }, [isLoadingMore, colors.secondary]);

  const newMessageNotification = (
    <Animated.View
      style={[
        styles.floatingNotification,
        {
          opacity: newMessageAnim,
          transform: [
            { translateY: newMessageAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) },
            { scale: newMessageAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[colors.secondary, colors.highlight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.notificationGradient}
      >
        <MaterialCommunityIcons name="bell-ring" size={20} color="#FFFFFF" />
        <Text style={[styles.notificationText, { fontFamily: fonts.bold }]}>
          Nova mensagem disponível!
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderEmptyState = () => {
    if (isLoadingInitial) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.semibold }]}>
            Carregando mensagens...
          </Text>
        </View>
      );
    }
    if (!token) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: "rgba(255,59,48,0.1)" }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF3B30" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
            Erro ao recuperar sessão
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.emptyButtonText, { fontFamily: fonts.bold }]}>IR PARA LOGIN</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (isConnecting) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.semibold }]}>
            Conectando ao serviço...
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: "rgba(229,57,53,0.1)" }]}>
          <MaterialCommunityIcons name="message-text-outline" size={48} color={colors.secondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
          Nenhuma mensagem ainda
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
          Novas mensagens aparecerão aqui em tempo real
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <LinearGradient
        colors={["#000000", "#1a1a1a", "#B71C1C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent" }}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>Timeline</Text>
                <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
                  Acompanhe em tempo real
                </Text>
              </View>
              <ConnectionIndicator isConnected={isConnected} fonts={fonts} />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <CustomAlertProvider>
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                // ── ETAPA 4: header com spinner de "carregando mais" ──
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.xl + 60,
                  paddingHorizontal: spacing.md,
                }}
                // ── ETAPA 4: paginação ao rolar para cima ──
                onEndReachedThreshold={0.3}
                onEndReached={fetchOlderMessages}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[colors.secondary]}
                    tintColor={colors.secondary}
                  />
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={7}
                removeClippedSubviews={Platform.OS === "android"}
              />
              {newMessageNotification}
            </>
          )}
        </CustomAlertProvider>
      </Animated.View>
    </View>
  );
}

// ─── Styles (sem alterações em relação ao original) ───────────────────────────

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  header: { paddingBottom: 40, zIndex: 1 },
  headerContent: {
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingHorizontal: 20,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 28, color: "#FFFFFF", marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  connectionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  connectionText: { fontSize: 12 },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    zIndex: 2,
  },
  messageCard: {
    width: width - 32,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    padding: 20,
  },
  colorBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  vipBadgeCard: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#8E24AA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  vipBadgeCardGradient: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, gap: 5 },
  vipBadgeCardText: { color: "#FFF", fontSize: 13, letterSpacing: 0.8 },
  newIndicatorTop: { position: "absolute", top: 16, left: 20, flexDirection: "row", alignItems: "center", gap: 4, zIndex: 5 },
  newText: { fontSize: 10, color: "#FF5722", letterSpacing: 1 },
  messageContent: { marginTop: 12, marginBottom: 16 },
  messageText: { fontSize: 16, lineHeight: 24 },
  timestamp: { flexDirection: "row", alignItems: "center", gap: 6 },
  timestampText: { fontSize: 11 },
  lockedCard: { width: width - 32, alignSelf: "center", minHeight: 420, borderRadius: 16, overflow: "hidden" },
  lockedCardGradient: { flex: 1, minHeight: 420, position: "relative" },
  vipShineEffect: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  shineGradient: { flex: 1 },
  vipPremiumBadge: {
    alignSelf: "center",
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  vipPremiumGradient: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 20, gap: 8 },
  vipPremiumText: { color: "#000000", fontSize: 14, letterSpacing: 1.2 },
  lockedContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 28 },
  lockIconContainer: { position: "relative", marginBottom: 24 },
  lockIconGlow: { position: "absolute", top: -20, left: -20, right: -20, bottom: -20, justifyContent: "center", alignItems: "center" },
  glowCircle: { width: 120, height: 120, borderRadius: 60 },
  lockIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,215,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
  },
  lockedTitle: { fontSize: 22, marginBottom: 12, textAlign: "center", letterSpacing: 0.5 },
  lockedDescription: { fontSize: 14, textAlign: "center", marginBottom: 28, lineHeight: 22, maxWidth: 280 },
  vipFeatures: { width: "100%", marginBottom: 28, gap: 12 },
  vipFeatureItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
  vipFeatureText: { color: "rgba(255,255,255,0.9)", fontSize: 13 },
  unlockButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 32, gap: 10 },
  unlockButtonText: { color: "#FFFFFF", fontSize: 16, letterSpacing: 1 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  emptyTitle: { fontSize: 20, marginTop: 16, textAlign: "center", marginBottom: 8 },
  emptyDescription: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },
  emptyButton: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  emptyButtonText: { color: "#FFFFFF", fontSize: 14, letterSpacing: 0.5 },
  floatingNotification: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationGradient: { paddingVertical: 14, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 10 },
  notificationText: { color: "#FFFFFF", fontSize: 15 },
});
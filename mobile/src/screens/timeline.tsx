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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, BASE_URL } from "../config/Api";
import { CustomAlertProvider, showCustomAlert } from "../components/CustomAlert";
import { useTheme } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import SockJS from "sockjs-client";

// ─── Types ───────────────────────────────────────────────────────────────────
type People = "ALL" | "VIP" | "FREE";
type MessageType = "NORMAL" | "ALERT" | "GOAL" | "TIP" | "WARNING" | "INFO";
type Message = {
  id: string;
  content: string;
  created_at: string;
  people: People;
  isNew?: boolean;
  messageType?: MessageType;
};
type Props = NativeStackScreenProps<RootStackParamList, "Timeline">;

// ─── Constants ───────────────────────────────────────────────────────────────
const { width } = Dimensions.get("window");
const CHAT_BG = "#0E1621";
const BUBBLE_NORMAL = "#1E2C3D";
const BUBBLE_VIP = "#2A1F3D";
const BUBBLE_ALERT = "#3D1F1F";
const BUBBLE_GOAL = "#1F3D2A";
const BUBBLE_TIP = "#1F2E3D";
const BUBBLE_WARNING = "#3D2E1F";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const ids = new Set(existing.map((m) => m.id));
  const merged = [...existing, ...incoming.filter((m) => !ids.has(m.id))];
  merged.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return merged;
}

function detectMessageType(content: string): MessageType {
  const upper = content.toUpperCase();
  if (
    content.includes("🚨") ||
    upper.includes("ALERTA") ||
    upper.includes("URGENTE")
  )
    return "ALERT";
  if (
    content.includes("⚽") ||
    upper.includes("GOL") ||
    upper.includes("GOOOOL")
  )
    return "GOAL";
  if (
    content.includes("💡") ||
    upper.includes("DICA:") ||
    upper.includes("TIP:")
  )
    return "TIP";
  if (content.includes("⚠️") || upper.includes("ATENÇÃO")) return "WARNING";
  if (content.includes("ℹ️") || upper.includes("INFO:")) return "INFO";
  return "NORMAL";
}

function getMessageStyle(type: MessageType, isVip: boolean) {
  if (isVip)
    return {
      bubbleColor: BUBBLE_VIP,
      accentColor: "#FFD700",
      borderColor: "rgba(255, 215, 0, 0.4)",
      icon: "crown" as const,
      iconColor: "#FFD700",
      label: "VIP",
    };
  switch (type) {
    case "ALERT":
      return {
        bubbleColor: BUBBLE_ALERT,
        accentColor: "#FF3B30",
        borderColor: "rgba(255,59,48,0.4)",
        icon: "alert-circle" as const,
        iconColor: "#FF3B30",
        label: "ALERTA",
      };
    case "GOAL":
      return {
        bubbleColor: BUBBLE_GOAL,
        accentColor: "#34C759",
        borderColor: "rgba(52,199,89,0.4)",
        icon: "soccer" as const,
        iconColor: "#34C759",
        label: "GOL!",
      };
    case "TIP":
      return {
        bubbleColor: BUBBLE_TIP,
        accentColor: "#5AC8FA",
        borderColor: "rgba(90,200,250,0.4)",
        icon: "lightbulb-on" as const,
        iconColor: "#5AC8FA",
        label: "DICA",
      };
    case "WARNING":
      return {
        bubbleColor: BUBBLE_WARNING,
        accentColor: "#FF9F0A",
        borderColor: "rgba(255,159,10,0.4)",
        icon: "alert" as const,
        iconColor: "#FF9F0A",
        label: "ATENÇÃO",
      };
    case "INFO":
      return {
        bubbleColor: BUBBLE_NORMAL,
        accentColor: "#64D2FF",
        borderColor: "rgba(100,210,255,0.3)",
        icon: "information" as const,
        iconColor: "#64D2FF",
        label: "INFO",
      };
    default:
      return {
        bubbleColor: BUBBLE_NORMAL,
        accentColor: "#E53935",
        borderColor: "rgba(229,57,53,0.3)",
        icon: null,
        iconColor: "transparent",
        label: null,
      };
  }
}

// ─── Formatted Text ───────────────────────────────────────────────────────────
const renderFormattedText = (text: string, accentColor: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/gs);
  return (
    <Text style={telegramStyles.messageText}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={telegramStyles.boldText}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <Text
              key={index}
              style={[telegramStyles.italicText, { color: accentColor }]}
            >
              {part.slice(1, -1)}
            </Text>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <Text key={index} style={telegramStyles.codeText}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return (
          <Text key={index} style={telegramStyles.normalText}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

// ─── NewBadge (absolute, non-layout-affecting) ───────────────────────────────
/**
 * Badge "NOVO" absolutamente posicionado no canto superior direito do bubble.
 * Usa apenas Animated nativo — sem dependências externas.
 * Não afeta o layout do bubble (position: absolute).
 */
const NewBadge = React.memo(function NewBadge({ fonts }: { fonts: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in na montagem
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Pulse contínuo
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        newBadgeStyles.wrap,
        { opacity: fadeIn, transform: [{ scale: pulseAnim }] },
      ]}
    >
      {/* Dot pulsante */}
      <View style={newBadgeStyles.dot} />
      <Text style={[newBadgeStyles.text, { fontFamily: fonts.bold }]}>NOVO</Text>
    </Animated.View>
  );
});

const newBadgeStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: -8,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF5722",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    // Sombra colorida para destacar sem poluir
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FFF",
    opacity: 0.9,
  },
  text: {
    fontSize: 9,
    color: "#FFF",
    letterSpacing: 0.8,
  },
});

// ─── MessageBubble ────────────────────────────────────────────────────────────
const MessageBubble = React.memo(function MessageBubble({
  item,
  index,
  userSubscription,
  navigation,
  fonts,
  messagesLength,
  scrollToEnd,
}: any) {
  const isVipMessage = item.people === "VIP";
  const isLast = index === messagesLength - 1;
  const type = item.messageType ?? detectMessageType(item.content);
  const msgStyle = getMessageStyle(type, isVipMessage);
  const scaleAnim = useRef(new Animated.Value(item.isNew ? 0.92 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(item.isNew ? 0 : 1)).current;

  useEffect(() => {
    if (item.isNew) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [item.isNew]);

  if (isVipMessage && userSubscription !== "VIP") {
    return (
      <Animated.View
        style={[
          telegramStyles.lockedBubble,
          {
            marginBottom: isLast ? 24 : 12,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#1A1228", "#0F0D1A"]}
          style={telegramStyles.lockedGradient}
        >
          <LinearGradient
            colors={["transparent", "rgba(255,215,0,0.15)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={telegramStyles.lockedShine}
          />
          <View style={telegramStyles.lockedBadge}>
            <LinearGradient
              colors={["#FFD700", "#FFA000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={telegramStyles.lockedBadgeGradient}
            >
              <MaterialCommunityIcons name="crown" size={14} color="#000" />
              <Text style={[telegramStyles.lockedBadgeText, { fontFamily: fonts.extrabold }]}>
                MENSAGEM VIP
              </Text>
            </LinearGradient>
          </View>
          <View style={telegramStyles.lockedIconWrap}>
            <View style={telegramStyles.lockedIconRing}>
              <MaterialCommunityIcons name="lock" size={36} color="#FFD700" />
            </View>
          </View>
          <Text style={[telegramStyles.lockedTitle, { fontFamily: fonts.bold }]}>
            Conteúdo exclusivo VIP
          </Text>
          <Text style={[telegramStyles.lockedDesc, { fontFamily: fonts.regular }]}>
            Assine o plano VIP para desbloquear análises, tips exclusivos e muito mais
          </Text>
          {["Todas as mensagens VIP", "Análises e tips exclusivos", "Suporte prioritário"].map(
            (feat) => (
              <View key={feat} style={telegramStyles.lockedFeature}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
                <Text style={[telegramStyles.lockedFeatureText, { fontFamily: fonts.medium }]}>
                  {feat}
                </Text>
              </View>
            )
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("ProSubscription")}
            activeOpacity={0.85}
            style={telegramStyles.lockedCTA}
          >
            <LinearGradient
              colors={["#E53935", "#B71C1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={telegramStyles.lockedCTAGradient}
            >
              <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
              <Text style={[telegramStyles.lockedCTAText, { fontFamily: fonts.bold }]}>
                ASSINAR AGORA
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  }

  const hasLabel = msgStyle.label !== null;
  return (
    <Animated.View
      style={[
        telegramStyles.bubbleRow,
        {
          marginBottom: isLast ? 24 : 8,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Badge absolutamente posicionado — não afeta o layout */}
      {item.isNew && <NewBadge fonts={fonts} />}
      <View
        style={[
          telegramStyles.bubbleAccentLine,
          { backgroundColor: msgStyle.accentColor },
        ]}
      />
      <View
        style={[
          telegramStyles.bubble,
          {
            backgroundColor: msgStyle.bubbleColor,
            borderColor: msgStyle.borderColor,
          },
        ]}
      >
        {hasLabel && (
          <View style={telegramStyles.bubbleTypeRow}>
            {msgStyle.icon && (
              <MaterialCommunityIcons
                name={msgStyle.icon}
                size={14}
                color={msgStyle.accentColor}
              />
            )}
            <Text
              style={[
                telegramStyles.bubbleTypeLabel,
                { color: msgStyle.accentColor, fontFamily: fonts.extrabold },
              ]}
            >
              {msgStyle.label}
            </Text>

          </View>
        )}
        <View style={[telegramStyles.bubbleTextWrap, hasLabel && { marginTop: 6 }]}>
          {renderFormattedText(item.content, msgStyle.accentColor)}
        </View>
        <View style={telegramStyles.bubbleFooter}>

          <Text style={[telegramStyles.bubbleTime, { fontFamily: fonts.regular }]}>
            {moment(item.created_at).format("HH:mm")}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

// ─── ConnectionToggle ─────────────────────────────────────────────────────────
const ConnectionToggle = ({
  isConnected,
  isConnecting,
  onToggle,
  fonts,
  disabled = false,
}: {
  isConnected: boolean;
  isConnecting: boolean;
  onToggle: () => void;
  fonts: any;
  disabled?: boolean;
}) => {
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    if (isConnected) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop?.stop();
  }, [isConnected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.94, friction: 5, tension: 200, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start(() => onToggle());
  };

  const gradientColors: [string, string] = isConnecting
    ? ["#FB8C00", "#F57C00"]
    : isConnected
    ? ["#2E7D32", "#1B5E20"]
    : ["#C62828", "#B71C1C"];

  const iconName = isConnecting ? "wifi-arrow-up-down" : isConnected ? "wifi" : "wifi-off";
  const label = isConnecting ? "Conectando..." : isConnected ? "🔴 LIVE" : "ATIVAR LIVE";

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={isConnecting || disabled}
      >
        <LinearGradient colors={gradientColors} style={telegramStyles.toggleGradient}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialCommunityIcons name={iconName} size={18} color="#FFF" />
          </Animated.View>
          <Text style={[telegramStyles.toggleText, { fontFamily: fonts.bold }]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── DateSeparator ────────────────────────────────────────────────────────────
const DateSeparator = ({ date, fonts }: { date: string; fonts: any }) => (
  <View style={telegramStyles.dateSeparator}>
    <View style={telegramStyles.dateLine} />
    <View style={telegramStyles.datePill}>
      <Text style={[telegramStyles.datePillText, { fontFamily: fonts.semibold }]}>
        {moment(date).calendar(null, {
          sameDay: "[Hoje]",
          lastDay: "[Ontem]",
          lastWeek: "DD [de] MMMM",
          sameElse: "DD [de] MMMM [de] YYYY",
        })}
      </Text>
    </View>
    <View style={telegramStyles.dateLine} />
  </View>
);

// ─── TimelineScreen ───────────────────────────────────────────────────────────
export default function TimelineScreen({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();

  const [userSubscription, setUserSubscription] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLiveHint, setShowLiveHint] = useState(true);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const isNearBottomRef = useRef(true);
  const scrollOffsetRef = useRef(0);
  const contentHeightRef = useRef(0);
  const listHeightRef = useRef(0);
  const lastMessageIdRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const newMsgNotifAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("subscription").then((v) => {
      if (v) setUserSubscription(v);
    });
  }, []);

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

  useEffect(() => {
    if (!isTokenLoaded || !token) return;
    api.get("/auth/token/validate").catch(() => {
      showCustomAlert("Não foi possível validar sua sessão.", { title: "Erro" });
    });
  }, [isTokenLoaded, token]);

  // ─────────────────────────────────────────────────────────────────────────
  // HTTP: Initial fetch
  // ─────────────────────────────────────────────────────────────────────────
  const fetchInitialMessages = useCallback(async () => {
    if (!token) return;
    setIsLoadingInitial(true);
    try {
      const response = await api.get("/message", { params: { page: 0, size: 20 } });
      const data: Message[] = response.data.content ?? response.data;
      if (data.length > 0) {
        const sorted = [...data]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((m) => ({ ...m, messageType: detectMessageType(m.content) }));
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
  // HTTP: Sync novas mensagens (foreground)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchAfterLastId = useCallback(async () => {
    if (!token || lastMessageIdRef.current === null) return;
    try {
      const response = await api.get("/message", {
        params: { afterId: lastMessageIdRef.current },
      });
      const incoming: Message[] = response.data.content ?? response.data;
      if (incoming.length === 0) return;
      const withTypes = incoming.map((m) => ({
        ...m,
        messageType: detectMessageType(m.content),
      }));
      setMessages((prev) => {
        const merged = mergeMessages(prev, withTypes);
        lastMessageIdRef.current = Math.max(...merged.map((m) => Number(m.id)));
        return merged;
      });
      if (isNearBottomRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error("[Timeline] Erro ao sincronizar mensagens:", err);
    }
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────
  // HTTP: Load older messages (paginação)
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
      const withTypes = older.map((m) => ({
        ...m,
        messageType: detectMessageType(m.content),
      }));
      setMessages((prev) => mergeMessages(prev, withTypes));
      setCurrentPage(nextPage);
      setHasMorePages(nextPage + 1 < (response.data.totalPages ?? 1));
    } catch (err) {
      console.error("[Timeline] Erro ao carregar mensagens antigas:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [token, isLoadingMore, hasMorePages, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────
  // AppState: sync ao voltar ao foreground
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") fetchAfterLastId();
    });
    return () => sub.remove();
  }, [fetchAfterLastId]);

  useEffect(() => {
    if (isTokenLoaded && token) fetchInitialMessages();
  }, [isTokenLoaded, token]);

  // ─────────────────────────────────────────────────────────────────────────
  // WebSocket Toggle
  //
  // CORREÇÕES:
  //  1. SockJS usa URL HTTP/HTTPS — não converte para ws:// (SockJS faz isso internamente)
  //  2. Token enviado via connectHeaders (STOMP) E query param (HandshakeInterceptor HTTP)
  //  3. Endpoint alinhado com registerStompEndpoints: /ws/chat
  // ─────────────────────────────────────────────────────────────────────────
  const toggleWebSocket = useCallback(() => {
    if (!isTokenLoaded || !token) return;

    if (isConnected) {
      stompClient?.deactivate();
      setStompClient(null);
      setIsConnected(false);
      return;
    }

    setIsConnecting(true);
    setShowLiveHint(false);

    // ✅ FIX 1: SockJS precisa de URL HTTP/HTTPS — não converte para ws://
    // O BASE_URL já deve ser http:// ou https://
    // O token vai como query param para o HandshakeInterceptor Java ler no HTTP handshake
    const sockJsUrl = `${BASE_URL}/ws/chat?token=${encodeURIComponent(token)}`;

    const client = new Client({
      // ✅ FIX 2: webSocketFactory com URL HTTP correta para SockJS
      webSocketFactory: () => new SockJS(sockJsUrl),

      // ✅ FIX 3: Token também nos connectHeaders STOMP
      // O WebSocketAuthInterceptor pode ler daqui se implementar ChannelInterceptor
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        setStompClient(client);
        setIsConnecting(false);
        setIsConnected(true);

        // Heartbeat manual a cada 20s para manter a sessão ativa
        (client as any)._heartbeatTimer = setInterval(() => {
          client.publish({ destination: "/app/heartbeat", body: "{}" });
        }, 20000);
      },

      onDisconnect: () => {
        setStompClient(null);
        setIsConnected(false);
        setIsConnecting(false);
        clearInterval((client as any)._heartbeatTimer);
      },

      onStompError: (frame) => {
        console.error("[STOMP] error:", frame?.headers?.message);
        setIsConnecting(false);
        setIsConnected(false);
        clearInterval((client as any)._heartbeatTimer);
      },
    });

    // ✅ FIX 4: Handlers de erro/close no nível WebSocket
    client.onWebSocketClose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      clearInterval((client as any)._heartbeatTimer);
    };

    client.onWebSocketError = () => {
      setIsConnecting(false);
      setIsConnected(false);
      clearInterval((client as any)._heartbeatTimer);
    };

    client.activate();
  }, [isConnected, stompClient, token, isTokenLoaded]);

  // ─────────────────────────────────────────────────────────────────────────
  // WebSocket subscription
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!stompClient) return;
    const sub = stompClient.subscribe("/topic/messages", (msg) => {
      if (!msg.body) return;
      let messageDTO: Message;
      try {
        messageDTO = JSON.parse(msg.body);
      } catch {
        return;
      }
      // FIX: "FREE" estava ausente — mensagens para usuários gratuitos não apareciam no modo live
      const shouldAdd =
        messageDTO.people === "ALL" ||
        messageDTO.people === "VIP" ||
        messageDTO.people === "FREE";
      if (!shouldAdd) return;

      const newMessage: Message = {
        ...messageDTO,
        id: messageDTO.id.toString(),
        isNew: true,
        messageType: detectMessageType(messageDTO.content),
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        const incomingId = Number(newMessage.id);
        if (lastMessageIdRef.current === null || incomingId > lastMessageIdRef.current) {
          lastMessageIdRef.current = incomingId;
        }
        return [...prev, newMessage];
      });

      Animated.sequence([
        Animated.spring(newMsgNotifAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(newMsgNotifAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      if (isNearBottomRef.current) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
        setNewMessagesCount(0);
      } else {
        setNewMessagesCount((c) => c + 1);
        setShowScrollToBottom(true);
      }

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, isNew: false } : m))
        );
      }, 3000);
    });
    return () => sub.unsubscribe();
  }, [stompClient]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cleanup
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stompClient?.deactivate();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Pull-to-refresh
  // ─────────────────────────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setMessages([]);
    lastMessageIdRef.current = null;
    await fetchInitialMessages();
    setIsRefreshing(false);
  }, [fetchInitialMessages]);

  // ─────────────────────────────────────────────────────────────────────────
  // Scroll handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      scrollOffsetRef.current = contentOffset.y;
      contentHeightRef.current = contentSize.height;
      listHeightRef.current = layoutMeasurement.height;
      const distanceFromBottom =
        contentSize.height - contentOffset.y - layoutMeasurement.height;
      const nearBottom = distanceFromBottom < 120;
      isNearBottomRef.current = nearBottom;
      if (nearBottom) {
        setShowScrollToBottom(false);
        setNewMessagesCount(0);
      } else {
        setShowScrollToBottom(true);
      }
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setShowScrollToBottom(false);
    setNewMessagesCount(0);
    isNearBottomRef.current = true;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Agrupa mensagens por data para os separadores
  // ─────────────────────────────────────────────────────────────────────────
  type ListItem = Message | { type: "date_separator"; date: string; id: string };
  const listData: ListItem[] = React.useMemo(() => {
    const result: ListItem[] = [];
    let lastDate = "";
    for (const msg of messages) {
      const msgDate = moment(msg.created_at).format("YYYY-MM-DD");
      if (msgDate !== lastDate) {
        result.push({ type: "date_separator", date: msg.created_at, id: `sep_${msgDate}` });
        lastDate = msgDate;
      }
      result.push(msg);
    }
    return result;
  }, [messages]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      if ("type" in item && item.type === "date_separator") {
        return <DateSeparator date={item.date} fonts={fonts} />;
      }
      const msg = item as Message;
      const msgIndex = messages.findIndex((m) => m.id === msg.id);
      return (
        <MessageBubble
          item={msg}
          index={msgIndex}
          userSubscription={userSubscription}
          navigation={navigation}
          fonts={fonts}
          messagesLength={messages.length}
          scrollToEnd={scrollToBottom}
        />
      );
    },
    [userSubscription, navigation, fonts, messages, scrollToBottom]
  );

  const renderListHeader = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator size="small" color="#E53935" />
        <Text style={[telegramStyles.loadingText, { fontFamily: fonts.regular }]}>
          Carregando mensagens antigas...
        </Text>
      </View>
    );
  }, [isLoadingMore, fonts]);

  const renderEmptyState = () => {
    if (isLoadingInitial) {
      return (
        <View style={telegramStyles.emptyState}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={[telegramStyles.emptyTitle, { fontFamily: fonts.semibold }]}>
            Carregando mensagens...
          </Text>
        </View>
      );
    }
    if (!token) {
      return (
        <View style={telegramStyles.emptyState}>
          <View style={[telegramStyles.emptyIconWrap, { backgroundColor: "rgba(255,59,48,0.1)" }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF3B30" />
          </View>
          <Text style={[telegramStyles.emptyTitle, { fontFamily: fonts.bold }]}>
            Sessão expirada
          </Text>
          <TouchableOpacity
            style={telegramStyles.emptyBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[telegramStyles.emptyBtnText, { fontFamily: fonts.bold }]}>IR PARA LOGIN</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={telegramStyles.emptyState}>
        <View style={[telegramStyles.emptyIconWrap, { backgroundColor: "rgba(229,57,53,0.08)" }]}>
          <MaterialCommunityIcons name="message-text-outline" size={52} color="#E53935" />
        </View>
        <Text style={[telegramStyles.emptyTitle, { fontFamily: fonts.bold }]}>
          Nenhuma mensagem ainda
        </Text>
        <Text style={[telegramStyles.emptyDesc, { fontFamily: fonts.regular }]}>
          {isConnected
            ? "Aguardando novas mensagens ao vivo..."
            : isConnecting
            ? "Conectando ao live..."
            : "Ative o LIVE para receber mensagens em tempo real"}
        </Text>

        {/* FIX: botao so aparece se o usuario ainda nao ativou o live */}
        {!isConnected && !isConnecting && (
          <TouchableOpacity
            onPress={toggleWebSocket}
            activeOpacity={0.85}
            style={telegramStyles.emptyLiveBtn}
          >
            <LinearGradient
              colors={["#E53935", "#B71C1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={telegramStyles.emptyLiveBtnGradient}
            >
              <MaterialCommunityIcons name="wifi" size={18} color="#FFF" />
              <Text style={[telegramStyles.emptyLiveBtnText, { fontFamily: fonts.bold }]}>
                ATIVAR LIVE
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Indicador quando live ja esta ativo mas ainda sem mensagens */}
        {(isConnected || isConnecting) && (
          <View style={telegramStyles.emptyLiveActiveWrap}>
            <ActivityIndicator
              size="small"
              color={isConnected ? "#34C759" : "#FB8C00"}
            />
            <Text style={[telegramStyles.emptyLiveActiveText, { fontFamily: fonts.medium }]}>
              {isConnected ? "Live ativo - aguardando mensagens" : "Conectando..."}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={telegramStyles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Header ── */}
      <LinearGradient
        colors={["#000000", "#1a0000", "#B71C1C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={telegramStyles.header}
      >
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent" }}>
          <View style={telegramStyles.headerInner}>
            <View style={telegramStyles.headerLeft}>
              <LinearGradient
                colors={["#E53935", "#B71C1C"]}
                style={telegramStyles.headerAvatar}
              >
                <MaterialCommunityIcons name="soccer" size={20} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[telegramStyles.headerTitle, { fontFamily: fonts.bold }]}>
                  ChamaGol
                </Text>
                <Text style={[telegramStyles.headerSubtitle, { fontFamily: fonts.regular }]}>
                  {isConnected
                    ? "🟢 transmitindo ao vivo"
                    : isConnecting
                    ? "🟡 conectando..."
                    : "⚪ mensagens sincronizadas"}
                </Text>
              </View>
            </View>
            <ConnectionToggle
              isConnected={isConnected}
              isConnecting={isConnecting}
              onToggle={toggleWebSocket}
              fonts={fonts}
              disabled={!isTokenLoaded || !token}
            />
          </View>
          {showLiveHint && !isConnected && (
            <Animated.View style={[telegramStyles.hint, { opacity: hintOpacity }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FF9F0A" />
              <Text style={[telegramStyles.hintText, { fontFamily: fonts.medium }]}>
                Toque em ATIVAR LIVE para mensagens em tempo real
              </Text>
            </Animated.View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* ── Chat body ── */}
      <Animated.View
        style={[
          telegramStyles.chatBody,
          {
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
                data={listData}
                keyExtractor={(item) => ("id" in item ? item.id : item.id)}
                renderItem={renderItem}
                ListHeaderComponent={renderListHeader}
                contentContainerStyle={telegramStyles.listContent}
                onLayout={() => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                    isNearBottomRef.current = true;
                  }, 100);
                }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReachedThreshold={0.2}
                onEndReached={fetchOlderMessages}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={["#E53935"]}
                    tintColor={"#E53935"}
                  />
                }
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={7}
                removeClippedSubviews={Platform.OS === "android"}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 1,
                  autoscrollToTopThreshold: 10,
                }}
              />

              {/* ── Nova mensagem flutuante ── */}
              <Animated.View
                style={[
                  telegramStyles.newMsgNotif,
                  {
                    opacity: newMsgNotifAnim,
                    transform: [
                      {
                        translateY: newMsgNotifAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [80, 0],
                        }),
                      },
                      { scale: newMsgNotifAnim },
                    ],
                  },
                ]}
                pointerEvents="none"
              >
                <LinearGradient
                  colors={["#E53935", "#B71C1C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={telegramStyles.newMsgNotifGradient}
                >
                  <MaterialCommunityIcons name="bell-ring" size={18} color="#FFF" />
                  <Text style={[telegramStyles.newMsgNotifText, { fontFamily: fonts.bold }]}>
                    Nova mensagem!
                  </Text>
                </LinearGradient>
              </Animated.View>

              {/* ── Botão "ir para o fim" ── */}
              {showScrollToBottom && (
                <TouchableOpacity
                  style={telegramStyles.scrollToBottomBtn}
                  onPress={scrollToBottom}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#1E2C3D", "#152030"]}
                    style={telegramStyles.scrollToBottomGradient}
                  >
                    {newMessagesCount > 0 && (
                      <View style={telegramStyles.newCountBadge}>
                        <Text style={[telegramStyles.newCountText, { fontFamily: fonts.bold }]}>
                          {newMessagesCount}
                        </Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-down" size={24} color="#E53935" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </CustomAlertProvider>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const telegramStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingBottom: 16,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFF",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 1,
  },
  toggleGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  toggleText: {
    color: "#FFF",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,159,10,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,159,10,0.2)",
  },
  hintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    flex: 1,
  },
  chatBody: {
    flex: 1,
    backgroundColor: CHAT_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -12,
    overflow: "hidden",
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 6,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  datePillText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.3,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: width - 24,
    position: "relative",  // necessário para o NewBadge absolute funcionar
  },
  bubbleAccentLine: {
    width: 3,
    borderRadius: 2,
    alignSelf: "stretch",
    marginRight: 8,
    marginTop: 4,
    marginBottom: 4,
    opacity: 0.85,
  },
  bubble: {
    flex: 1,
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
  },
  bubbleTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  bubbleTypeLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  bubbleTextWrap: {},
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#EAEAEA",
  },
  normalText: {
    color: "#EAEAEA",
  },
  boldText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  italicText: {
    fontStyle: "italic",
    opacity: 0.95,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 13,
    color: "#A8DAFF",
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 6,
  },
  bubbleTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
  },
  // newBadge styles movidos para newBadgeStyles (componente NewBadge)
  lockedBubble: {
    width: width - 32,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
  },
  lockedGradient: {
    padding: 24,
    alignItems: "center",
  },
  lockedShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  lockedBadge: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  lockedBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  lockedBadgeText: {
    fontSize: 13,
    color: "#000",
    letterSpacing: 1,
  },
  lockedIconWrap: {
    marginBottom: 16,
  },
  lockedIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockedTitle: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  lockedDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  lockedFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 8,
    marginBottom: 8,
  },
  lockedFeatureText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  lockedCTA: {
    width: "100%",
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  lockedCTAGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  lockedCTAText: {
    color: "#FFF",
    fontSize: 15,
    letterSpacing: 0.8,
  },
  newMsgNotif: {
    position: "absolute",
    bottom: 72,
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newMsgNotifGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  newMsgNotifText: {
    color: "#FFF",
    fontSize: 14,
  },
  scrollToBottomBtn: {
    position: "absolute",
    bottom: 24,
    right: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollToBottomGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  newCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    zIndex: 1,
  },
  newCountText: {
    color: "#FFF",
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#FFF",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  emptyLiveBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  emptyLiveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyLiveBtnText: {
    color: "#FFF",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  // Estado vazio com live ativo
  emptyLiveActiveWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  emptyLiveActiveText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
});
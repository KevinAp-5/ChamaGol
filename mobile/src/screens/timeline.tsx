import { Client } from "@stomp/stompjs";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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

type Message = {
  id: string;
  campeonato: string;
  nomeTimes: string;
  tempoPartida: string;
  placar: string;
  acaoSinal: string;
  createdAt: string;
  status: "ACTIVE" | "INACTIVE" | string;
  isNew?: boolean;
  tipoEvento?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, "Timeline">;

// Componente de Badge de Status
const StatusBadge = ({ isActive, colors, fonts }: any) => (
  <View 
    style={[
      styles.statusBadge,
      { 
        backgroundColor: isActive 
          ? 'rgba(52, 199, 89, 0.15)' 
          : 'rgba(117, 117, 117, 0.15)',
        borderColor: isActive ? '#34C759' : '#757575',
      }
    ]}
  >
    <View 
      style={[
        styles.statusDot,
        { backgroundColor: isActive ? '#34C759' : '#757575' }
      ]} 
    />
    <Text 
      style={[
        styles.statusText,
        { 
          color: isActive ? '#34C759' : '#757575',
          fontFamily: fonts.semibold 
        }
      ]}
    >
      {isActive ? 'ATIVO' : 'ENCERRADO'}
    </Text>
  </View>
);

// Componente memoizado para cada mensagem
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
  const isActive = item.status === "ACTIVE";
  const isVIPSignal = item.tipoEvento === "VIP";
  const isLast = index === messagesLength - 1;

  // VIP bloqueado - Card chamativo para usuários FREE
  if (isVIPSignal && userSubscription !== "VIP") {
    return (
      <View
        style={[
          styles.lockedCard,
          {
            marginBottom: isLast ? spacing.xl : spacing.md,
          },
        ]}
      >
        <LinearGradient
          colors={['#1a1a1a', '#0a0a0a']}
          style={styles.lockedCardGradient}
        >
          {/* Efeito de brilho VIP */}
          <View style={styles.vipShineEffect}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 215, 0, 0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shineGradient}
            />
          </View>

          {/* Badge VIP Premium */}
          <View style={styles.vipPremiumBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vipPremiumGradient}
            >
              <MaterialCommunityIcons name="crown" size={16} color="#000" />
              <Text style={[styles.vipPremiumText, { fontFamily: fonts.extrabold }]}>
                SINAL VIP
              </Text>
            </LinearGradient>
          </View>

          {/* Conteúdo bloqueado */}
          <View style={styles.lockedContent}>
            <View style={styles.lockIconContainer}>
              <View style={styles.lockIconGlow}>
                <LinearGradient
                  colors={['rgba(229, 57, 53, 0.3)', 'rgba(229, 57, 53, 0)']}
                  style={styles.glowCircle}
                />
              </View>
              <View style={styles.lockIconWrapper}>
                <MaterialCommunityIcons
                  name="lock"
                  size={48}
                  color="#FFD700"
                />
              </View>
            </View>

            <Text
              style={[
                styles.lockedTitle,
                {
                  color: '#FFFFFF',
                  fontFamily: fonts.bold,
                }
              ]}
            >
              Sinal Exclusivo VIP
            </Text>
            
            <Text
              style={[
                styles.lockedDescription,
                {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: fonts.regular,
                }
              ]}
            >
              Desbloqueie sinais premium, análises exclusivas e aumente seus lucros
            </Text>

            {/* Features VIP */}
            <View style={styles.vipFeatures}>
              <View style={styles.vipFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
                <Text style={[styles.vipFeatureText, { fontFamily: fonts.medium }]}>
                  Sinais em tempo real
                </Text>
              </View>
              <View style={styles.vipFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
                <Text style={[styles.vipFeatureText, { fontFamily: fonts.medium }]}>
                  Análises detalhadas
                </Text>
              </View>
              <View style={styles.vipFeatureItem}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#34C759" />
                <Text style={[styles.vipFeatureText, { fontFamily: fonts.medium }]}>
                  Suporte prioritário
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.unlockButton}
              onPress={() => navigation.navigate("ProSubscription")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E53935', '#B71C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.unlockButtonGradient}
              >
                <MaterialCommunityIcons name="crown" size={22} color="#FFD700" />
                <Text style={[styles.unlockButtonText, { fontFamily: fonts.bold }]}>
                  ASSINAR AGORA
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Mensagem normal
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
      {/* Border lateral colorida */}
      <View 
        style={[
          styles.colorBorder,
          { backgroundColor: isActive ? colors.secondary : colors.muted }
        ]} 
      />

      {/* Badge VIP - Melhorado */}
      {isVIPSignal && (
        <View style={styles.vipBadgeCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vipBadgeCardGradient}
          >
            <MaterialCommunityIcons name="crown" size={14} color="#000" />
            <Text style={[styles.vipBadgeCardText, { fontFamily: fonts.extrabold }]}>
              VIP
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Header do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <MaterialCommunityIcons 
            name="soccer" 
            size={20} 
            color={colors.secondary} 
          />
          <Text 
            style={[
              styles.championship,
              { color: colors.secondary, fontFamily: fonts.bold }
            ]}
          >
            {item.campeonato}
          </Text>
        </View>
        <StatusBadge isActive={isActive} colors={colors} fonts={fonts} />
      </View>

      {/* Times */}
      <View style={styles.teamsContainer}>
        <Text 
          style={[
            styles.teams,
            { color: colors.primary, fontFamily: fonts.bold }
          ]}
        >
          {item.nomeTimes}
        </Text>
        {item.isNew && (
          <View style={styles.newIndicator}>
            <FireGif />
            <Text style={[styles.newText, { fontFamily: fonts.bold }]}>
              NOVO
            </Text>
          </View>
        )}
      </View>

      {/* Info do Jogo */}
      <View style={styles.matchDetails}>
        <View style={styles.detailItem}>
          <View style={[styles.detailIcon, { backgroundColor: 'rgba(229, 57, 53, 0.1)' }]}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={18} 
              color={colors.secondary} 
            />
          </View>
          <View>
            <Text style={[styles.detailLabel, { color: colors.muted, fontFamily: fonts.regular }]}>
              Tempo
            </Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontFamily: fonts.semibold }]}>
              {item.tempoPartida}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailItem}>
          <View style={[styles.detailIcon, { backgroundColor: 'rgba(229, 57, 53, 0.1)' }]}>
            <MaterialCommunityIcons 
              name="scoreboard-outline" 
              size={18} 
              color={colors.secondary} 
            />
          </View>
          <View>
            <Text style={[styles.detailLabel, { color: colors.muted, fontFamily: fonts.regular }]}>
              Placar
            </Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontFamily: fonts.semibold }]}>
              {item.placar}
            </Text>
          </View>
        </View>
      </View>

      {/* Ação do Sinal - Border mais grosso */}
      <View 
        style={[
          styles.signalAction,
          { 
            backgroundColor: isActive 
              ? 'rgba(229, 57, 53, 0.1)' 
              : 'rgba(117, 117, 117, 0.1)',
            borderColor: isActive ? colors.secondary : colors.muted,
          }
        ]}
      >
        <View style={[styles.signalIcon, { backgroundColor: isActive ? 'rgba(229, 57, 53, 0.15)' : 'rgba(117, 117, 117, 0.15)' }]}>
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={24} 
            color={isActive ? colors.secondary : colors.muted} 
          />
        </View>
        <Text 
          style={[
            styles.signalActionText,
            { 
              color: isActive ? colors.secondary : colors.muted,
              fontFamily: fonts.bold
            }
          ]}
        >
          {item.acaoSinal}
        </Text>
      </View>

      {/* Timestamp */}
      <View style={styles.timestamp}>
        <MaterialCommunityIcons 
          name="clock-time-four-outline" 
          size={12} 
          color={colors.muted} 
        />
        <Text 
          style={[
            styles.timestampText,
            { color: colors.muted, fontFamily: fonts.regular }
          ]}
        >
          {moment(item.createdAt).format("DD/MM/YYYY • HH:mm")}
        </Text>
      </View>
    </View>
  );
});

// Componente de indicador de conexão
const ConnectionIndicator = ({ isConnected, colors, fonts }: any) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
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
            backgroundColor: isConnected ? '#34C759' : '#FF3B30',
            transform: [{ scale: isConnected ? pulseAnim : 1 }]
          }
        ]} 
      />
      <Text 
        style={[
          styles.connectionText,
          { 
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: fonts.medium 
          }
        ]}
      >
        {isConnected ? 'Conectado' : 'Desconectado'}
      </Text>
    </View>
  );
};

export default function SinaisScreen({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();
  const [userSubscription, setUserSubscription] = useState<String | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  const flatListRef = useRef<FlatList>(null);
  const newMessageAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fade in animation on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const getUserSubscription = async () => {
      try {
        const storedUserSubscription = await AsyncStorage.getItem("subscription");
        if (storedUserSubscription) {
          setUserSubscription(storedUserSubscription);
        }
      } catch (error) {
        console.log("Erro ao recuperar userSubscription");
      }
    };
    getUserSubscription();
  }, []);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");
        if (storedToken) {
          setToken(storedToken);
        } else {
          console.log("Token não encontrado");
          showCustomAlert("Sessão expirada. Faça login novamente.", { title: "Acesso negado" });
          navigation.navigate("Login");
        }
        setIsTokenLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar token:", error);
        setIsTokenLoaded(true);
      }
    };
    getToken();
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const tokenResponse = await api.get("/auth/token/validate");
        if (!tokenResponse) {
          showCustomAlert(
            "Acesso atualizado, faça login novamente para continuar!",
            { title: "Alerta" }
          );
          navigation.navigate("Login");
        }
      } catch (error) {
        console.log("Erro ao validar token", error);
        showCustomAlert(
          "Não foi possível validar sua sessão. Tente novamente mais tarde.",
          { title: "Erro" }
        );
      }
    };
    
    if (isTokenLoaded && token) {
      validateToken();
    }
  }, [isTokenLoaded, token]);

  useEffect(() => {
    if (!isTokenLoaded || !token) {
      return;
    }

    setIsConnecting(true);
    
    // const socket = new SockJS(`http://192.168.0.103:8080/ws/chat?token=${token}`);
    // const socket = new SockJS(`${BASE_URL}/ws/chat?token=${token}`);
    const socket = new SockJS(`https://chamagol.com/ws/chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setStompClient(client);
        setIsConnecting(false);
        setIsConnected(true);
        console.log("Conectado ao WebSocket");
      },
      onDisconnect: () => {
        setStompClient(null);
        setIsConnected(false);
        console.log("Desconectado do WebSocket");
      },
      onStompError: (frame) => {
        console.error("Erro reportado pelo broker: " + frame.headers["message"]);
        console.error("Detalhes adicionais: " + frame.body);
        setIsConnecting(false);
        setIsConnected(false);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isTokenLoaded, token]);

  useEffect(() => {
    if (!stompClient) return;

    const subscriptionMsg = stompClient.subscribe("/topic/messages", (msg) => {
      if (msg.body) {
        const signalMsg: Message = JSON.parse(msg.body);
        const newMessage = {
          ...signalMsg,
          id: signalMsg.id.toString(),
          isNew: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        
        // Animate new message notification
        Animated.sequence([
          Animated.spring(newMessageAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.delay(2500),
          Animated.timing(newMessageAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Remove isNew flag after animation completes
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === newMessage.id ? { ...m, isNew: false } : m
            )
          );
        }, 3000);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      subscriptionMsg.unsubscribe();
    };
  }, [stompClient]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const renderItem = React.useCallback(
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

  // New message notification bubble
  const newMessageNotification = (
    <Animated.View 
      style={[
        styles.floatingNotification,
        {
          opacity: newMessageAnim,
          transform: [
            { 
              translateY: newMessageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0]
              })
            },
            {
              scale: newMessageAnim
            }
          ]
        }
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
          Novo sinal disponível!
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const renderEmptyState = () => {
    if (!isTokenLoaded) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.semibold }]}>
            Carregando...
          </Text>
        </View>
      );
    }
    
    if (!token) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={48} 
              color="#FF3B30" 
            />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
            Erro ao recuperar sessão
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
            Por favor, faça login novamente para continuar
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.emptyButtonText, { fontFamily: fonts.bold }]}>
              IR PARA LOGIN
            </Text>
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
          <Text style={[styles.emptyDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
            Aguarde enquanto estabelecemos a conexão
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: 'rgba(229, 57, 53, 0.1)' }]}>
          <MaterialCommunityIcons 
            name="signal-variant" 
            size={48} 
            color={colors.secondary} 
          />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.primary, fontFamily: fonts.bold }]}>
          Nenhum sinal disponível
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.muted, fontFamily: fonts.regular }]}>
          Novos sinais aparecerão aqui automaticamente em tempo real
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#B71C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
                  Sinais ao Vivo
                </Text>
                <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
                  Acompanhe em tempo real
                </Text>
              </View>
              <ConnectionIndicator 
                isConnected={isConnected} 
                colors={colors} 
                fonts={fonts} 
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          { 
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
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
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.xl + 60,
                  paddingHorizontal: spacing.md,
                }}
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
                removeClippedSubviews={Platform.OS === 'android'}
              />
              {newMessageNotification}
            </>
          )}
        </CustomAlertProvider>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  header: {
    paddingBottom: 40,
    zIndex: 1,
  },
  headerContent: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    zIndex: 2,
  },
  messageCard: {
    width: width - 32,
    alignSelf: "center",
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    padding: 20,
  },
  colorBorder: {
    position: 'absolute',
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
    overflow: 'hidden',
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  vipBadgeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 5,
  },
  vipBadgeCardText: {
    color: "#000000",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  championship: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  teams: {
    fontSize: 18,
    flex: 1,
    lineHeight: 24,
  },
  newIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newText: {
    fontSize: 10,
    color: '#FF5722',
    letterSpacing: 1,
  },
  matchDetails: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 12,
    borderRadius: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 16,
  },
  signalAction: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2.5,
    gap: 12,
  },
  signalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalActionText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timestampText: {
    fontSize: 11,
  },
  // Estilos para card VIP bloqueado (usuários FREE)
  lockedCard: {
    width: width - 32,
    alignSelf: "center",
    minHeight: 420,
    borderRadius: 16,
    overflow: 'hidden',
  },
  lockedCardGradient: {
    flex: 1,
    minHeight: 420,
    position: 'relative',
  },
  vipShineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  shineGradient: {
    flex: 1,
  },
  vipPremiumBadge: {
    alignSelf: 'center',
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  vipPremiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
  },
  vipPremiumText: {
    color: "#000000",
    fontSize: 14,
    letterSpacing: 1.2,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  lockIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  lockIconGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  lockIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  lockedTitle: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  lockedDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    maxWidth: 280,
  },
  vipFeatures: {
    width: '100%',
    marginBottom: 28,
    gap: 12,
  },
  vipFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  vipFeatureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  unlockButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 1,
  },
  // Empty States
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  floatingNotification: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
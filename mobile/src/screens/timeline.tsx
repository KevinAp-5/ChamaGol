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
import SockJS from "sockjs-client";
import FireGif from "../components/fire";
import * as SecureStore from "expo-secure-store";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../config/Api";
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

  // VIP bloqueado
  if (isVIPSignal && userSubscription !== "VIP") {
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          {
            backgroundColor: colors.card,
            borderLeftColor: colors.secondary,
            borderLeftWidth: 5,
            marginBottom: isLast ? spacing.xl : spacing.md,
            ...shadows.medium,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(229, 57, 53, 0.05)', 'rgba(229, 57, 53, 0.1)']}
          style={styles.proGradient}
        />
        <View style={styles.lockIconContainer}>
          <MaterialCommunityIcons
            name="lock"
            size={32}
            color={colors.secondary}
          />
        </View>
        <Text
          style={{
            color: colors.secondary,
            fontFamily: fonts.bold,
            fontSize: 18,
            marginBottom: spacing.sm,
            textAlign: 'center',
          }}
        >
          Sinal exclusivo para assinantes VIP!
        </Text>
        <Text
          style={{
            color: colors.muted,
            fontFamily: fonts.regular,
            fontSize: 14,
            marginBottom: spacing.md,
            textAlign: 'center',
          }}
        >
          Desbloqueie acesso a sinais exclusivos e análises premium
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: colors.secondary,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            marginTop: spacing.sm,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={() => {
            navigation.navigate("PROSubscription");
          }}
        >
          <Text style={{ color: colors.card, fontFamily: fonts.bold, marginRight: spacing.sm }}>
            ASSINAR AGORA
          </Text>
          <MaterialCommunityIcons name="star" size={18} color={colors.card} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Mensagem normal
  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          backgroundColor: colors.card,
          borderLeftColor: isActive ? colors.secondary : colors.muted,
          borderLeftWidth: 5,
          marginBottom: isLast ? spacing.xl : spacing.md,
          ...shadows.medium,
        },
        item.isNew && {
          transform: [{ scale: 1.02 }],
          shadowOpacity: 0.3,
          shadowRadius: 15,
          elevation: 8,
        },
      ]}
    >
      {isVIPSignal && (
        <View style={styles.proBadge}>
          <LinearGradient
            colors={[colors.secondary, colors.highlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proBadgeGradient}
          >
            <Text style={[styles.proBadgeText, { fontFamily: fonts.bold }]}>VIP</Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.campeonato, { color: colors.accent, fontFamily: fonts.bold }]}>
          {item.campeonato}
        </Text>
        <Text style={[styles.createdAt, { color: colors.muted, fontFamily: fonts.regular }]}>
          {moment(item.createdAt).format("DD/MM HH:mm")}
        </Text>
      </View>

      <View style={styles.rowWithIcon}>
        <Text 
          style={[
            styles.nomeTimes, 
            { 
              color: colors.primary, 
              fontFamily: fonts.semibold,
              flex: 1 
            }
          ]}
        >
          {item.nomeTimes}
        </Text>
        {item.isNew && <FireGif />}
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.matchInfoItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={colors.muted} />
          <Text style={[styles.tempoPartida, { color: colors.primary, fontFamily: fonts.medium }]}>
            {item.tempoPartida}
          </Text>
        </View>
        <View style={styles.matchInfoItem}>
          <MaterialCommunityIcons name="scoreboard-outline" size={16} color={colors.muted} />
          <Text style={[styles.placar, { color: colors.primary, fontFamily: fonts.medium }]}>
            {item.placar}
          </Text>
        </View>
      </View>

      <View 
        style={[
          styles.acaoSinalContainer, 
          { backgroundColor: isActive ? 'rgba(229, 57, 53, 0.1)' : 'rgba(117, 117, 117, 0.1)' }
        ]}
      >
        <MaterialCommunityIcons 
          name={isActive ? "lightning-bolt" : "information-outline"} 
          size={20} 
          color={isActive ? colors.secondary : colors.muted} 
        />
        <Text 
          style={[
            styles.acaoSinal, 
            { 
              color: isActive ? colors.secondary : colors.muted,
              fontFamily: fonts.semibold
            }
          ]}
        >
          {item.acaoSinal}
        </Text>
      </View>
    </Animated.View>
  );
});

export default function TimelineScreen({ navigation }: Props) {
  const { colors, fonts, shadows, spacing, borderRadius } = useTheme();
  const [userSubscription, setUserSubscription] = useState<String | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const flatListRef = useRef<FlatList>(null);

  const newMessageAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fade in animation on component mount
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
    ]).start();
  }, []);

  useEffect(() => {
    const getUserSubscription = async () => {
      try {
        const storedUserSubscription = await AsyncStorage.getItem(
          "subscription"
        );
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
          showCustomAlert("Sessão expirada. Faça login novamente.", "Acesso negado");
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
            "Alerta"
          );
          navigation.navigate("Login");
        }
      } catch (error) {
        console.log("Erro ao validar token", error);
        showCustomAlert(
          "Não foi possível validar sua sessão. Tente novamente mais tarde.",
          "Erro"
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
    
    // const socket = new SockJS(`https://chamagol-9gfb.onrender.com/ws/chat?token=${token}`);
    const socket = new SockJS(`https://chamagol.com/ws/chat?token=${token}`);
    // const socket = new SockJS(`http://192.168.1.10:8080/ws/chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setStompClient(client);
        setIsConnecting(false);
        console.log("Conectado ao WebSocket");
      },
      onDisconnect: () => {
        setStompClient(null);
        console.log("Desconectado do WebSocket");
      },
      onStompError: (frame) => {
        console.error("Erro reportado pelo broker: " + frame.headers["message"]);
        console.error("Detalhes adicionais: " + frame.body);
        setIsConnecting(false);
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
          Animated.timing(newMessageAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(newMessageAnim, {
            toValue: 0,
            duration: 300,
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
    // Here you would typically fetch latest messages from an API
    // For now, we'll just simulate a refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Memoize renderItem para não recriar a função a cada render
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

  // Se os cards têm altura fixa, use getItemLayout:
  const ITEM_HEIGHT = 180; // ajuste conforme o real
  const getItemLayout = React.useCallback(
    (_data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // New message notification bubble
  const newMessageNotification = (
    <Animated.View 
      style={[
        styles.newMessageNotification,
        {
          opacity: newMessageAnim,
          transform: [
            { 
              translateY: newMessageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }
          ]
        }
      ]}
    >
      <MaterialCommunityIcons name="bell-ring" size={18} color="#FFF" />
      <Text style={styles.newMessageText}>Novo sinal recebido!</Text>
    </Animated.View>
  );

  const renderEmptyState = () => {
    if (!isTokenLoaded) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.emptyText, { color: colors.muted, fontFamily: fonts.regular }]}>
            Carregando...
          </Text>
        </View>
      );
    }
    
    if (!token) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.muted, fontFamily: fonts.regular }]}>
            Erro ao recuperar token. Faça login novamente.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.secondary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={{ color: "#FFF", fontFamily: fonts.bold }}>
              IR PARA LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (isConnecting) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={[styles.emptyText, { color: colors.muted, fontFamily: fonts.regular }]}>
            Conectando ao serviço de sinais...
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="signal-variant" size={64} color={colors.muted} />
        <Text style={[styles.emptyText, { color: colors.muted, fontFamily: fonts.regular }]}>
          Nenhum sinal disponível no momento.
        </Text>
        <Text style={[styles.emptySubText, { color: colors.muted, fontFamily: fonts.regular }]}>
          Novos sinais aparecerão aqui automaticamente.
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header (não contido na SafeAreaView para melhor design) */}
      <View style={{ backgroundColor: colors.primary }}>
        <LinearGradient
          colors={[colors.primary, colors.highlight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
                Timeline
              </Text>
              <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
                Sinais em tempo real
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      
      {/* Conteúdo principal */}
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
                  paddingBottom: spacing.xl,
                  paddingHorizontal: spacing.sm,
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
                getItemLayout={getItemLayout}
                removeClippedSubviews={true}
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
  headerGradient: {
    paddingBottom: 60, // Aumentado para criar espaço para o conteúdo sobrepor
    zIndex: 1,
  },
  headerContent: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    marginTop: -30, // Negativo para sobrepor ao header e criar efeito arredondado
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    zIndex: 2,
  },
  messageContainer: {
    width: width - 32,
    alignSelf: "center",
    padding: 16,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  proGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  campeonato: {
    fontSize: 16,
  },
  createdAt: {
    fontSize: 12,
  },
  rowWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  nomeTimes: {
    fontSize: 18,
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  matchInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  tempoPartida: {
    fontSize: 14,
    marginLeft: 6,
  },
  placar: {
    fontSize: 14,
    marginLeft: 6,
  },
  acaoSinalContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  acaoSinal: {
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  proBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  proBadgeGradient: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  newMessageNotification: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newMessageText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  lockIconContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
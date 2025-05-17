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
    const socket = new SockJS(`http://192.168.1.7:8080/ws/chat?token=${token}`);
    
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

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const isActive = item.status === "ACTIVE";
    const isPROSignal = item.tipoEvento === "PRO";
    const isLast = index === messages.length - 1;
    
    // Handle PRO content for non-PRO users
    if (isPROSignal && userSubscription !== "PRO") {
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
            Sinal exclusivo para assinantes PRO!
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
              navigation.navigate("ProSubscription");
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

    // Regular message card
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
        {isPROSignal && (
          <View style={styles.proBadge}>
            <LinearGradient
              colors={[colors.secondary, colors.highlight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBadgeGradient}
            >
              <Text style={[styles.proBadgeText, { fontFamily: fonts.bold }]}>PRO</Text>
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
  };

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

  const renderHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.highlight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { fontFamily: fonts.bold }]}>
          Timeline
        </Text>
        <Text style={[styles.headerSubtitle, { fontFamily: fonts.regular }]}>
          Sinais em tempo real
        </Text>
      </View>
    </LinearGradient>
  );

  return (
    <CustomAlertProvider>
      <SafeAreaView 
        style={{ flex: 1, backgroundColor: colors.primary }}
        edges={['top']}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {renderHeader()}
        </Animated.View>
        
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
                  paddingVertical: spacing.md,
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
              />
              {newMessageNotification}
            </>
          )}
        </Animated.View>
      </SafeAreaView>
    </CustomAlertProvider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
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
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    overflow: 'hidden',
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
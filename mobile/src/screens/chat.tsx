import { Client, StompHeaders } from "@stomp/stompjs";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import SockJS from "sockjs-client";
import FireGif from "../components/fire";
import Title from "../components/title";
import { useTheme } from "../theme/theme";
import * as SecureStore from 'expo-secure-store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from "@react-native-async-storage/async-storage";

type Message = {
  id: string;
  campeonato: string;
  nomeTimes: string;
  tempoPartida: string;
  placar: string;
  acaoSinal: string;
  createdAt: string;
  status: "ACTIVE" | "INACTIVE" | string;
  isNew?: boolean; // flag para animação
  tipoEvento?: string; // Adicionado para o tipo do evento
};

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const FIRE_GIF = require("../assets/fire.gif");

export default function TimelineScreen({ route }: Props) {
  // Mudar o armazenamento dessa variável com asyncStorage.
  const [ userSubscription, setUserSubscription ] = useState<String | null>(null); // "PRO" ou "FREE"
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoaded, setIsTokenLoaded] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const getUserSubscription = async () => {
      try {
        const storedUserSubscription = await AsyncStorage.getItem("subscription");
        if (!storedUserSubscription) {
          console.log("userSubscription == false -> CHAT.tsx");
          return;
        }
        setUserSubscription(storedUserSubscription);
      } catch (error) {
        console.log("erro ao recuperar userSubscription -> CHAT.tsx")
      }
    }
    getUserSubscription();
  }, []);

  // Primeiro, recupera o token e configura o estado
  // TODO: validar se o token é valido antes do handshake do websocket
  // TODO: não precisa implementar por agora o refresh dos tokens
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('accessToken');
        if (storedToken) {
          setToken(storedToken);
          console.log("Token encontrado:", storedToken);
        } else {
          console.log("Token não encontrado!");
        }
        // Marca que o processo de carregamento do token foi concluído, independentemente do resultado
        setIsTokenLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar token:", error);
        // Também marca como concluído em caso de erro
        setIsTokenLoaded(true);
      }
    };

    getToken();
  }, []);

  useEffect(() => {
    // Só executa se o processo de carregamento do token foi concluído
    if (!isTokenLoaded) {
      return;
    }

    // Se não tiver token, loga e não tenta conectar
    if (!token) {
      console.warn("Tentativa de conectar ao WebSocket sem token");
      return;
    }

    console.log("Conectando ao WebSocket com token:", `http://192.168.1.7:8080/ws/chat?token=${token}`);
    const socket = new SockJS(`http://192.168.1.7:8080/ws/chat?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setStompClient(client);
        console.log("Conectado ao WebSocket");
      },
      onDisconnect: () => {
        setStompClient(null);
        console.log("Desconectado do WebSocket");
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      debug: () => {},
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isTokenLoaded, token]);

  // Subscrição às mensagens
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

        // Remover flag isNew após 3 segundos para parar animação
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === newMessage.id ? { ...m, isNew: false } : m
            )
          );
        }, 3000);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return () => {
      subscriptionMsg.unsubscribe();
    };
  }, [stompClient]);

  const renderItem = ({ item }: { item: Message }) => {
    const isActive = item.status === "ACTIVE";
    const isPROSignal = item.tipoEvento === "PRO";

    // Primeiro verifica se é PRO e usuário não é PRO
    if (isPROSignal && userSubscription !== "PRO") {
      return (
        <View style={[styles.messageContainer, { 
          backgroundColor: colors.card, 
          borderLeftColor: colors.secondary, 
          borderLeftWidth: 5 
        }]}>
          <Text style={{ color: colors.secondary, fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
            Sinal exclusivo para assinantes PRO!
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.secondary, borderRadius: 8, padding: 10, marginTop: 8 }}
            onPress={() => {/* navegue para tela de assinatura ou mostre modal */}}
          >
            <Text style={{ color: colors.background, fontWeight: "bold" }}>
              Seja PRO e desbloqueie sinais exclusivos!
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: colors.card,
            borderLeftColor: isActive ? colors.secondary : colors.muted,
            borderLeftWidth: 5,
            shadowColor: colors.muted,
            elevation: isPROSignal ? 8 : 5,
            shadowOpacity: isPROSignal ? 0.3 : 0.15,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.campeonato, { color: colors.accent }]}>
            {item.campeonato}
          </Text>
          <Text style={[styles.createdAt, { color: colors.muted }]}>
            {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </View>

        <View style={styles.rowWithIcon}>
          <Text style={[styles.nomeTimes, { color: colors.primary, flex: 1 }]}>
            {item.nomeTimes}
          </Text>
          {item.isNew && <FireGif />}
        </View>

        <View style={styles.matchInfo}>
          <Text style={[styles.tempoPartida, { color: colors.highlight }]}>
            {item.tempoPartida}
          </Text>
          <Text style={[styles.placar, { color: colors.highlight }]}>
            {item.placar}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.acaoSinal, { color: colors.secondary }]}>
            {item.acaoSinal}
          </Text>
          {isPROSignal && (
            <View style={styles.proTag}>
              <Text style={[styles.proTagText, { color: colors.accent }]}>PRO</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* <Title title="Timeline" /> */}
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {!isTokenLoaded 
                ? "Carregando..." 
                : !token 
                  ? "Erro ao recuperar token. Faça login novamente." 
                  : "Nenhum sinal disponível no momento."}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: 16,
              paddingHorizontal: 8,
            }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  messageContainer: {
    width: "90%",
    alignSelf: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  campeonato: {
    fontWeight: "bold",
    fontSize: 16,
  },
  createdAt: {
    fontSize: 12,
    fontStyle: "italic",
  },
  rowWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  nomeTimes: {
    fontSize: 18,
    fontWeight: "600",
  },
  fireIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  tempoPartida: {
    fontSize: 14,
    fontWeight: "500",
  },
  placar: {
    fontSize: 14,
    fontWeight: "500",
  },
  acaoSinal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontStyle: "italic",
  },
  proBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
  },
  proBadgeText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  proTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FF7043",
  },
  proTagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
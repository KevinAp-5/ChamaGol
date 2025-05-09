import { Client } from "@stomp/stompjs";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import SockJS from "sockjs-client";
import FireGif from "../components/fire";
import Title from "../components/title";
import { useTheme } from "../theme/theme";

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
};

const FIRE_GIF = require("../assets/fire.gif");

export default function TimelineScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const socket = new SockJS("http://192.168.1.7:8080/ws/chat");
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
  }, []);

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

        // Vibrar ao receber novo sinal
        // Vibration.vibrate(500);

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

    return (
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: colors.card,
            borderLeftColor: isActive ? colors.secondary : colors.muted,
            borderLeftWidth: 5,
            shadowColor: colors.muted,
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
          {/* Mostra fogo pequeno se isNew */}
          {item.isNew && (
            <FireGif></FireGif>
          )}
        </View>

        <View style={styles.matchInfo}>
          <Text style={[styles.tempoPartida, { color: colors.highlight }]}>
            {item.tempoPartida}
          </Text>
          <Text style={[styles.placar, { color: colors.highlight }]}>
            {item.placar}
          </Text>
        </View>

        <Text style={[styles.acaoSinal, { color: colors.secondary }]}>
          {item.acaoSinal}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Title title="Timeline" />
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Nenhum sinal disponível no momento.
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
});

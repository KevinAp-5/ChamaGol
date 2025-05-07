import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../theme/theme";
import Title from "../components/title";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ThreeDots from "../components/loading";

type Message = {
  id: string;
  sender: string;
  text: string;
  loading?: boolean;
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [username] = useState<string>("Você");
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [botTyping, setBotTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Conexão e assinatura do websocket
  useEffect(() => {
    const socket = new SockJS("http://192.168.1.7:8080/ws/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setStompClient(client);
      },
      onDisconnect: () => {
        setStompClient(null);
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

  // Assina o tópico de mensagens
  useEffect(() => {
    if (!stompClient) return;

    // Mensagens normais
    const subscriptionMsg = stompClient.subscribe("/topic/messages", (msg) => {
      if (msg.body) {
        const chatMsg = JSON.parse(msg.body);
        setBotTyping(false);
        setMessages((prev) => {
          // Se for mensagem do usuário e já existe, não adiciona de novo
          if (
            chatMsg.sender === username &&
            prev.some(
              (m) =>
                m.sender === username &&
                m.text === chatMsg.text &&
                !m.loading
            )
          ) {
            return prev;
          }
          let filtered = prev;
          if (chatMsg.sender === "CHAMAGOL IA") {
            filtered = prev.filter((m) => !m.loading);
          }
          return [
            ...filtered,
            {
              id: Date.now().toString() + Math.random().toString(),
              sender: chatMsg.sender,
              text: chatMsg.text,
            },
          ];
        });
      }
    });

    // Sinal de "digitando"
    const subscriptionTyping = stompClient.subscribe("/topic/typing", () => {
      setMessages((prev) => {
        // Só adiciona o loading se não existir ainda
        if (!prev.some((m) => m.loading)) {
          return [
            ...prev,
            {
              id: "typing-indicator",
              sender: "CHAMAGOL IA",
              text: "",
              loading: true,
            },
          ];
        }
        return prev;
      });
      setBotTyping(true);
    });

    return () => {
      subscriptionMsg.unsubscribe();
      subscriptionTyping.unsubscribe();
    };
  }, [stompClient]);

  // Envia mensagem para o backend
  const sendMessage = () => {
    if (stompClient && input.trim()) {
      const userMsg = {
        id: Date.now().toString() + Math.random().toString(),
        sender: username,
        text: input,
      };
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: "typing-indicator",
          sender: "CHAMAGOL IA",
          text: "",
          loading: true,
        },
      ]);
      stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify({ sender: username, text: input }),
      });
      setInput("");
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.sender === username;
    if (item.loading) {
      return (
        <View
          style={[
            styles.messageContainer,
            styles.botBubble,
            {
              alignSelf: "flex-start",
              backgroundColor: colors.card,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              marginLeft: 0,
              marginRight: 40,
            },
          ]}
        >
          <ThreeDots color={colors.secondary} />
        </View>
      );
    }
    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myBubble : styles.botBubble,
          {
            alignSelf: isMine ? "flex-end" : "flex-start",
            backgroundColor: isMine ? colors.secondary : colors.card,
            borderTopRightRadius: isMine ? 0 : 16,
            borderTopLeftRadius: isMine ? 16 : 0,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            marginLeft: isMine ? 40 : 0,
            marginRight: isMine ? 0 : 40,
          },
        ]}
      >
        {!isMine && (
          <Text style={[styles.user, { color: colors.accent, marginBottom: 2 }]}>
            {item.sender}
          </Text>
        )}
        <Text
          style={[
            styles.text,
            { color: isMine ? colors.background : colors.primary },
          ]}
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Title title="CHAMAGOL Chat" />
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.primary,
                  borderColor: colors.secondary,
                  backgroundColor: colors.card,
                },
              ]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: input.trim()
                    ? colors.secondary
                    : colors.muted,
                },
              ]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Text style={[styles.sendButtonText, { color: colors.background }]}>
                Enviar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: "75%",
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 40,
    justifyContent: "center",
  },
  myBubble: {
    backgroundColor: "#6200EE",
  },
  botBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  user: {
    fontWeight: "bold",
    fontSize: 13,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 120,
  },
  sendButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  sendButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

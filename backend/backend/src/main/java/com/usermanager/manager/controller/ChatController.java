// ChatController.java
package com.usermanager.manager.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.usermanager.manager.dto.common.ChatMessage;

@Controller
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final List<Message> messageHistory = new CopyOnWriteArrayList<>();

    @Value("${openroute.security.token.secret}")
    private String TOKEN;

    private static final int MAX_HISTORY = 10;
    private static final int MAX_TOKENS = 2000;

    private static final String INITIAL_PROMPT = "Você é um assistente empolgado chamado 'FURIA IA'. Seu papel é conversar em português com torcedores apaixonados pela FURIA Esports. Seja carismático e fale com entusiasmo sobre o time de CS:GO da FURIA, especialmente os jogadores FalleN, chelo, yuurih, skullz e KSCERATO. Você pode mencionar conquistas da organização como o desempenho histórico no IEM Rio Major 2022, os títulos da ESL Pro League e a paixão da torcida brasileira. Sempre incentive o torcedor a continuar apoiando o time e mostre orgulho de representar o Brasil.";

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        messageHistory.add(new Message("system", INITIAL_PROMPT));
    }

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage handleMessage(ChatMessage message) {
        if (!"FURIA IA".equals(message.sender())) {
            messageHistory.add(new Message("user", message.text()));
            truncateHistory();

            // Envia sinal de "digitando" para o frontend
            new Thread(() -> {
                messagingTemplate.convertAndSend("/topic/typing", "typing");
                sendToAI();
            }).start();
        }
        return message;
    }

    private void truncateHistory() {
        while (messageHistory.size() > MAX_HISTORY || totalTokens() > MAX_TOKENS) {
            if (!messageHistory.get(0).role.equals("system")) {
                messageHistory.remove(0);
            } else {
                break;
            }
        }
    }

    private int totalTokens() {
        return messageHistory.stream().mapToInt(Message::estimateTokens).sum();
    }

    private void sendToAI() {
        try {
            HttpClient client = HttpClient.newHttpClient();
            ObjectMapper mapper = new ObjectMapper();
            ArrayNode messagesNode = mapper.createArrayNode();
            for (Message msg : messageHistory) {
                ObjectNode node = mapper.createObjectNode();
                node.put("role", msg.role);
                node.put("content", msg.content);
                messagesNode.add(node);
            }

            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", "deepseek/deepseek-chat:free");
            payload.set("messages", messagesNode);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Authorization", "Bearer " + TOKEN)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String answer = extractAnswerFromJson(response.body());

            ChatMessage aiMsg = new ChatMessage("FURIA IA", answer);
            messageHistory.add(new Message("assistant", answer));
            truncateHistory();

            messagingTemplate.convertAndSend("/topic/messages", aiMsg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String extractAnswerFromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                String content = message.path("content").asText();
                return content.replace("\\n", "\n").trim().replace("*", "").replace("#", "");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "Desculpe, não entendi.";
    }

    private static class Message {
        String role;
        String content;

        Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        static int estimateTokens(String text) {
            return text.length() / 4;
        }

        int estimateTokens() {
            return estimateTokens(this.content);
        }
    }
}

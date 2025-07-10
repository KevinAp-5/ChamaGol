// ChatController.java
package com.usermanager.manager.controller;

import java.time.ZonedDateTime;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import com.usermanager.manager.dto.common.ChatMessage;
import com.usermanager.manager.enums.Status;
import com.usermanager.manager.enums.TipoEvento;
import com.usermanager.manager.model.signal.Signal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Timeline", description = "Endpoints de timeline e mensagens em tempo real")
@Controller
@EnableScheduling
public class TimelineController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicLong counter = new AtomicLong(1);

    public TimelineController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enviar mensagem para o tópico de sinais (WebSocket)", description = "Envia uma mensagem para todos os clientes conectados via WebSocket.")
    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public ChatMessage handleMessage(ChatMessage message) {
        return message;
    }

    // TODO: antes de mostrar os sinais dos topicos, criar botão que vai fazer o fetch dos sinais anteriores.
    @Operation(summary = "Agendamento de envio de sinais automáticos", description = "Envia sinais automáticos a cada 7 segundos para o tópico de sinais.")
    // @Scheduled(fixedRate = 7000)
    public void scheduleMessage() {
        long id = counter.getAndIncrement();
        TipoEvento evento = TipoEvento.DICA;
        if (id % 3 == 0) {
            evento = TipoEvento.VIP;
        }
        Signal signal = Signal.builder()
                .id(id)
                .campeonato("Campeonato Brasileiro")
                .nomeTimes("Flamengo x Palmeiras")
                .tempoPartida("75'")
                .placar("2x1")
                .acaoSinal("Aposta: Vitória do Flamengo")
                .createdAt(ZonedDateTime.now())
                .status(Status.ACTIVE)
                .tipoEvento(evento)
                .build();

        messagingTemplate.convertAndSend("/topic/messages", signal);
    }
}
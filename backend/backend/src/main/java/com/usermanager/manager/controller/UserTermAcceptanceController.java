package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.term.AcceptanceRequest;
import com.usermanager.manager.dto.term.TermAcceptedResponse;
import com.usermanager.manager.exception.user.UserNotFoundException;
import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.model.term.UserTermAcceptance;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.term.TermOfUseService;
import com.usermanager.manager.service.term.UserTermAcceptanceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Aceite de Termos", description = "Endpoints para aceite dos termos de uso")
@RestController
@RequestMapping("/api/acceptance")
@Slf4j
public class UserTermAcceptanceController {

    private final UserTermAcceptanceService acceptanceService;
    private final TermOfUseService termOfUseService;

    public UserTermAcceptanceController(UserTermAcceptanceService acceptanceService,
                                        TermOfUseService termOfUseService) {
        this.acceptanceService = acceptanceService;
        this.termOfUseService = termOfUseService;
    }

    @Operation(summary = "Aceitar o termo de uso mais recente")
    @ApiResponse(responseCode = "200", description = "Termo aceito")
    @PostMapping("/accept-latest")
    public ResponseEntity<TermAcceptedResponse> acceptLatestTerm(
        @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user,
        @RequestBody(
            description = "Dados de aceite do termo",
            required = true,
            content = @Content(schema = @Schema(implementation = AcceptanceRequest.class))
        )
        AcceptanceRequest request
    ) {
        TermOfUse latestTerm = termOfUseService.findLatest();
        var isAdult = true;
        if (!(request == null || request.isAdult() == null)) {
            isAdult = request.isAdult();
        }

        UserTermAcceptance acceptance = acceptanceService.acceptTerm(user, latestTerm, isAdult);

        return ResponseEntity.ok(new TermAcceptedResponse(acceptance.getTermOfUse(), acceptance.getIsAdult(), acceptance.getAcceptedAt(), acceptance.getUser().getLogin()));
    }

    @Operation(summary = "Verificar se usuário aceitou o termo mais recente")
    @ApiResponse(responseCode = "200", description = "Retorna true se aceitou, false caso contrário")
    @GetMapping("/has-accepted-latest")
    public ResponseEntity<Boolean> hasAcceptedLatest(
        @Parameter(description = "Usuário autenticado") @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            throw new UserNotFoundException("");
        }
        TermOfUse latestTerm = termOfUseService.findLatest();
        boolean accepted = acceptanceService.hasAcceptedLatestTerm(user, latestTerm);
        return ResponseEntity.ok(accepted);
    }
}

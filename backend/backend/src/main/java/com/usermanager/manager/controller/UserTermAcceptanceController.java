package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.usermanager.manager.dto.term.AcceptanceRequest;
import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.model.term.UserTermAcceptance;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.service.term.TermOfUseService;
import com.usermanager.manager.service.term.UserTermAcceptanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/acceptance")
public class UserTermAcceptanceController {

    private final UserTermAcceptanceService acceptanceService;
    private final TermOfUseService termOfUseService;

    public UserTermAcceptanceController(UserTermAcceptanceService acceptanceService,
                                        TermOfUseService termOfUseService) {
        this.acceptanceService = acceptanceService;
        this.termOfUseService = termOfUseService;
    }

    @PostMapping("/accept-latest")
    public ResponseEntity<?> acceptLatestTerm(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody AcceptanceRequest request) {
        TermOfUse latestTerm = termOfUseService.findLatest()
                .orElseThrow(() -> new IllegalStateException("Nenhum termo cadastrado"));

        UserTermAcceptance acceptance = acceptanceService.acceptTerm(user, latestTerm, request.isAdult());

        return ResponseEntity.ok(acceptance);
    }

    @GetMapping("/has-accepted-latest")
    public ResponseEntity<Boolean> hasAcceptedLatest(@AuthenticationPrincipal User user) {
        TermOfUse latestTerm = termOfUseService.findLatest()
                .orElseThrow(() -> new IllegalStateException("Nenhum termo cadastrado"));

        boolean accepted = acceptanceService.hasAcceptedLatestTerm(user, latestTerm);
        return ResponseEntity.ok(accepted);
    }
}

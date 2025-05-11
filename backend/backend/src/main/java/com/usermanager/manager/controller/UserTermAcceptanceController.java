package com.usermanager.manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

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

    // TODO: adicionar o aceitar do termo no controller de registro
    @PostMapping("/accept-latest")
    public ResponseEntity<TermAcceptedResponse> acceptLatestTerm(@AuthenticationPrincipal User user, @Valid @RequestBody AcceptanceRequest request) {
        TermOfUse latestTerm = termOfUseService.findLatest();

        UserTermAcceptance acceptance = acceptanceService.acceptTerm(user, latestTerm, request.isAdult());

        return ResponseEntity.ok(new TermAcceptedResponse(acceptance.getTermOfUse(), acceptance.getIsAdult(), acceptance.getAcceptedAt(), acceptance.getUser().getLogin()));
    }

    @GetMapping("/has-accepted-latest")
    public ResponseEntity<Boolean> hasAcceptedLatest(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new UserNotFoundException("");
        }
        TermOfUse latestTerm = termOfUseService.findLatest();
        boolean accepted = acceptanceService.hasAcceptedLatestTerm(user, latestTerm);
        return ResponseEntity.ok(accepted);
    }
}

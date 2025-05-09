package com.usermanager.manager.service.term.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.model.term.UserTermAcceptance;
import com.usermanager.manager.model.user.User;
import com.usermanager.manager.repository.term.UserTermAcceptanceRepository;
import com.usermanager.manager.service.term.UserTermAcceptanceService;

@Service
public class UserTermAcceptanceServiceImpl implements UserTermAcceptanceService {
    private final UserTermAcceptanceRepository acceptanceRepository;

    public UserTermAcceptanceServiceImpl(UserTermAcceptanceRepository acceptanceRepository) {
        this.acceptanceRepository = acceptanceRepository;
    }

    @Transactional
    public UserTermAcceptance acceptTerm(User user, TermOfUse termOfUse, Boolean isAdult) {
        if (!isAdult) {
            throw new IllegalAccessError("Usuários de menoridade não é permitido. Registro cancelado");
        }

        // Verifica se já aceitou essa versão
        Optional<UserTermAcceptance> existing = acceptanceRepository.findByUserAndTermOfUse(user, termOfUse);
        if (existing.isPresent()) {
            return existing.get();
        }

        UserTermAcceptance acceptance = new UserTermAcceptance();
        acceptance.setUser(user);
        acceptance.setTermOfUse(termOfUse);
        acceptance.setIsAdult(isAdult);
        return acceptanceRepository.save(acceptance);
    }

    @Transactional
    public boolean hasAcceptedLatestTerm(User user, TermOfUse latestTerm) {
        return acceptanceRepository.existsByUserAndTermOfUse(user, latestTerm);
    }

    @Transactional
    public Optional<UserTermAcceptance> getLatestAcceptance(User user) {
        return acceptanceRepository.findTopByUserOrderByAcceptedAtDesc(user);
    }
}

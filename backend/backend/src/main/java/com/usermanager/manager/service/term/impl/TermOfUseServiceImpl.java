package com.usermanager.manager.service.term.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.usermanager.manager.exception.term.TermExistsException;
import com.usermanager.manager.exception.term.TermNotFoundException;
import com.usermanager.manager.model.term.TermOfUse;
import com.usermanager.manager.repository.term.TermOfUseRepository;
import com.usermanager.manager.service.term.TermOfUseService;

@Service
public class TermOfUseServiceImpl implements TermOfUseService {
    private final TermOfUseRepository termOfUseRepository;

    public TermOfUseServiceImpl(TermOfUseRepository termOfUseRepository) {
        this.termOfUseRepository = termOfUseRepository;
    }

    @Transactional
    public TermOfUse createTerm(String version, String content) {
        boolean exists = termOfUseRepository.existsByVersion(version);
        if (exists) {
            throw new TermExistsException(version);
        }

        TermOfUse term = new TermOfUse();
        term.setVersion(version);
        term.setContent(content);
        return termOfUseRepository.save(term);
    }

    @Transactional
    public TermOfUse findByVersion(String version) {
        return termOfUseRepository.findByVersion(version).orElseThrow(
            () -> new TermNotFoundException("Termo não encontrado")
        );
    }

    @Transactional
    public TermOfUse findLatest() {
        return termOfUseRepository.findTopByOrderByCreatedAtDesc().orElseThrow(
            () -> new TermNotFoundException("Nenhum termo cadastrado")
            );
    }

    @Transactional
    public List<TermOfUse> findAll() {
        return termOfUseRepository.findAll();
    }
}
